const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { broadcastNewOrder, broadcastStatusUpdate } = require('../socket/socketHandler');

// @route   GET api/orders
// @desc    Get all orders with items
// @access  Public
router.get('/', async (req, res) => {
  const { status, table_id } = req.query;
  let query = `
    SELECT 
      o.id, o.table_id, o.customer_name, o.total_amount, o.status, o.created_at,
      t.table_number
    FROM orders o
    LEFT JOIN tables t ON o.table_id = t.id
  `;
  const queryParams = [];

  const conditions = [];
  if (status) {
    conditions.push(`o.status = ?`);
    queryParams.push(status);
  }
  if (table_id) {
    conditions.push('o.table_id = ?');
    queryParams.push(table_id);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY o.created_at DESC';

  try {
    const [orders] = await pool.query(query, queryParams);

    for (const order of orders) {
      const [items] = await pool.query(`
        SELECT oi.id, oi.quantity, oi.unit_price, oi.subtotal, p.name as product_name, p.image_url as product_image_url
        FROM order_items oi
        JOIN products p ON oi.menu_item_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.order_items = items;
    }
    
    res.json(orders);
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).send({ msg: 'Server Error' });
  }
});

// @route   GET api/orders/:id
// @desc    Get a single order by ID
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [[order]] = await pool.query(`
      SELECT 
        o.id, o.table_id, o.customer_name, o.total_amount, o.status, o.created_at, o.completed_at, o.delivered_at,
        t.table_number
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = ?
    `, [id]);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await pool.query(`
      SELECT oi.id, oi.quantity, oi.unit_price, oi.subtotal, p.name as product_name, p.image_url as product_image_url
      FROM order_items oi
      JOIN products p ON oi.menu_item_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    order.order_items = items;
    
    res.json(order);
  } catch (err) {
    console.error(`Fetch Order ${id} Error:`, err);
    res.status(500).send({ msg: 'Server Error' });
  }
});

// @route   POST api/orders
// @desc    Create a new order following the corrected flow
// @access  Public
router.post('/', async (req, res) => {
  const { table_id, customer_name, items, special_instructions } = req.body;

  if (!table_id || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required order details.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Calculate total amount on the server
    let totalAmount = 0;
    for (const item of items) {
      const [[product]] = await connection.query('SELECT price FROM products WHERE id = ?', [item.menu_item_id]);
      if (!product) {
        throw new Error(`Product with ID ${item.menu_item_id} not found.`);
      }
      totalAmount += product.price * item.quantity;
    }
    
    // 2. Insert into orders table
    const orderQuery = `
      INSERT INTO orders (table_id, customer_name, total_amount, special_instructions, status) 
      VALUES (?, ?, ?, ?, 'PENDING')
    `;
    const [orderResult] = await connection.query(orderQuery, [table_id, customer_name, totalAmount, special_instructions]);
    const orderId = orderResult.insertId;

    // 3. Insert into order_items table
    const itemPromises = items.map(item => {
      const subtotal = item.price * item.quantity;
      const itemQuery = `
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      return connection.query(itemQuery, [orderId, item.menu_item_id, item.quantity, item.price, subtotal, item.notes]);
    });
    await Promise.all(itemPromises);
    
    // 4. Update table status
    await connection.query('UPDATE tables SET status = ? WHERE id = ?', ['occupied', table_id]);

    await connection.commit();

    // 5. Fetch the complete order to broadcast
    const [[fullOrder]] = await connection.query(`
        SELECT o.*, t.table_number 
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        WHERE o.id = ?
    `, [orderId]);
    const [fullOrderItems] = await connection.query(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image_url 
        FROM order_items oi
        JOIN products p ON oi.menu_item_id = p.id
        WHERE oi.order_id = ?
    `, [orderId]);
    fullOrder.order_items = fullOrderItems;

    // 6. Broadcast via Socket.io
    const io = req.app.get('socketio');
    io.to('cashier_updates').emit('new_order', fullOrder);
    io.to('kitchen_updates').emit('new_order', fullOrder);

    res.status(201).json({ success: true, message: 'Order submitted successfully!', order_id: orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create order:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order.' });
  } finally {
    connection.release();
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/System
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const io = req.app.get('socketio');

  try {
    let timestampField = '';
    if (status === 'PAID') timestampField = 'paid_at';
    else if (status === 'COMPLETED') timestampField = 'completed_at';
    else if (status === 'DELIVERED') timestampField = 'delivered_at';

    let query = 'UPDATE orders SET status = ?';
    const queryParams = [status];

    if (timestampField) {
      query += `, ${timestampField} = CURRENT_TIMESTAMP`;
    }
    query += ' WHERE id = ?';
    queryParams.push(id);

    await pool.query(query, queryParams);

    // Fetch updated order details to broadcast
    const [[order]] = await pool.query(`
      SELECT o.*, t.table_number 
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = ?
    `, [id]);

    broadcastStatusUpdate(io, order, req.app);

    res.json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST api/orders/:id/feedback
// @desc    Submit customer feedback for delivered order
// @access  Public
router.post('/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const io = req.app.get('socketio');
  const connection = await pool.getConnection();

  try {
    // Verify order exists and is delivered
    const [[order]] = await connection.query(
      'SELECT o.*, c.customer_id FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id WHERE o.id = ? AND o.status = ?',
      [id, 'DELIVERED']
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not delivered' });
    }

    // Insert feedback
    await connection.query(
      'INSERT INTO customer_feedback (order_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [id, order.customer_id, rating, comment]
    );

    // Create notification for admin
    await connection.query(
      'INSERT INTO notifications (order_id, message, message_type) VALUES (?, ?, ?)',
      [id, `Customer feedback received for order #${id}`, 'SYSTEM']
    );

    // Emit customer_feedback event
    io.to('admin').emit('customer_feedback', {
      orderId: parseInt(id),
      rating,
      comment,
      customerId: order.customer_id
    });

    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// @route   GET /api/orders/:id/items
// @desc    Get all items for a given order (with product names)
// @access  Private (Admin only)
router.get('/:id/items', async (req, res) => {
  try {
    const orderId = req.params.id;
    const [items] = await pool.query(`
      SELECT oi.id, oi.quantity, oi.unit_price, oi.subtotal, oi.notes, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.menu_item_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;