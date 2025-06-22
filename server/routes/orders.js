const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// @route   GET api/orders
// @desc    Get all orders with items
// @access  Public
router.get('/', async (req, res) => {
  const { status } = req.query;
  const connection = await pool.getConnection();
  try {
    let orderQuery = 'SELECT * FROM orders';
    const queryParams = [];

    if (status) {
      const statusList = status.split(',').map(s => s.trim()).filter(s => s);
      if (statusList.length > 0) {
        orderQuery += ` WHERE status IN (${statusList.map(() => '?').join(',')})`;
        queryParams.push(...statusList);
      }
    }

    orderQuery += ' ORDER BY created_at DESC';

    const [orders] = await connection.query(orderQuery, queryParams);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await connection.query(`
          SELECT oi.*, mi.name 
          FROM order_items oi 
          JOIN menu_items mi ON oi.menu_item_id = mi.id 
          WHERE order_id = ?
        `, [order.id]);
        
        return {
          ...order,
          items: items
        };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).send({ msg: 'Server Error' });
  } finally {
    connection.release();
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Public
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const io = req.app.get('socketio');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    const [[updatedOrder]] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!updatedOrder) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await connection.query(
      `SELECT oi.*, mi.name 
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?`, [id]
    );

    await connection.commit();
    
    const fullOrder = { ...updatedOrder, items };

    // Define the payload for the update
    const updateData = { orderId: parseInt(id), status, order: fullOrder };

    // Emit status update to relevant rooms
    io.to('kitchen').emit('status_update', updateData);
    io.to('cashier').emit('status_update', updateData);
    io.to('waiter').emit('status_update', updateData);
    io.to(`table_${fullOrder.table_id}`).emit('status_update', updateData);

    // Specific notifications for waiters when an order is ready
    if (status === 'ready') {
      io.to('waiter').emit('order_ready', { orderId: parseInt(id), tableId: fullOrder.table_id, order: fullOrder });
    }
    
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to update order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Public
router.post('/', async (req, res) => {
  const { tableId, customerName, items, total_amount } = req.body;

  if (!tableId || !items || items.length === 0 || !total_amount) {
    return res.status(400).json({ msg: 'Please provide all required order details' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert into orders table
    const [orderResult] = await connection.query(
      'INSERT INTO orders (table_id, customer_name, total_amount) VALUES (?, ?, ?)',
      [tableId, customerName || 'Guest', total_amount]
    );
    const orderId = orderResult.insertId;

    // Insert into order_items table
    const orderItems = items.map(item => [orderId, item.menu_item_id, item.quantity, item.unit_price, item.subtotal]);
    await connection.query(
      'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal) VALUES ?',
      [orderItems]
    );

    await connection.commit();

    // Fetch the full order details to broadcast
    const [newlyCreatedOrder] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItemsResult] = await connection.query(
      'SELECT oi.*, mi.name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE order_id = ?', 
      [orderId]
    );

    // Emit socket event for new order
    const io = req.app.get('socketio');
    if (io && newlyCreatedOrder[0]) {
      const broadcastData = {
          ...newlyCreatedOrder[0],
          items: orderItemsResult
      };
      // Emit to all connected clients to ensure delivery
      io.emit('order_update', broadcastData);
      console.log('Broadcasting new order to all clients.');
    }

    res.json({ success: true, msg: 'Order placed successfully', orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Order Submission Error:', err);

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ msg: 'The selected table or a menu item is invalid.' });
    }
    
    res.status(500).send({ msg: 'Server Error' });
  } finally {
    connection.release();
  }
});

module.exports = router; 