const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/sales
// @desc    Process a payment and create a sales record
// @access  Private (Requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  const { order_id, payment_method, amount_paid, change_amount } = req.body;
  const cashier_id = req.user.id; // Get cashier's ID from JWT

  if (!order_id || !payment_method || amount_paid === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required payment details.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into sales table
    const salesQuery = `
      INSERT INTO sales (order_id, payment_method, amount_paid, change_amount, cashier_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(salesQuery, [order_id, payment_method, amount_paid, change_amount, cashier_id]);

    // 2. Update the order status to 'PAID'
    const orderUpdateQuery = `
      UPDATE orders 
      SET status = 'PAID', payment_status = 'paid', paid_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [updateResult] = await connection.query(orderUpdateQuery, [order_id]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Order not found or already processed.');
    }

    await connection.commit();

    // 3. Broadcast the status update via Socket.io
    const io = req.app.get('socketio');
    const [[order]] = await connection.query(`
        SELECT o.*, t.table_number 
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        WHERE o.id = ?
    `, [order_id]);
    
    // Notify kitchen, admin, and customer that the order is paid
    const updateData = { order_id: order.id, status: 'PAID', order };
    io.to('kitchen_updates').emit('order_status_update', updateData);
    io.to('admin_updates').emit('order_status_update', updateData);
    io.to(`table_${order.table_id}`).emit('order_status_update', updateData);
    
    // Also notify the cashier desk to remove the item
    io.to('cashier_updates').emit('order_status_update', updateData);


    res.status(201).json({ success: true, message: 'Payment processed successfully!' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to process payment:', error);
    res.status(500).json({ success: false, message: 'Server error while processing payment.' });
  } finally {
    connection.release();
  }
});

// @route   GET /api/sales
// @desc    Get all sales transactions with customer and cashier info
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT s.id, s.order_id, o.customer_name, s.payment_method, s.amount_paid, s.change_amount, u.name as cashier_name, s.transaction_date
      FROM sales s
      LEFT JOIN orders o ON s.order_id = o.id
      LEFT JOIN users u ON s.cashier_id = u.id
      ORDER BY s.transaction_date DESC
    `);
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sales/analytics
// @desc    Get sales analytics summary
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    // Total sales and revenue
    const [[totals]] = await pool.query(`
      SELECT COUNT(*) as total_sales, COALESCE(SUM(amount_paid),0) as total_revenue
      FROM sales
    `);

    // Sales by day (last 30 days)
    const [salesByDay] = await pool.query(`
      SELECT DATE(transaction_date) as date, COUNT(*) as sales_count, SUM(amount_paid) as revenue
      FROM sales
      WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(transaction_date)
      ORDER BY date ASC
    `);

    // Top 5 products
    const [topProducts] = await pool.query(`
      SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.menu_item_id = p.id
      GROUP BY oi.menu_item_id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Sales by category
    const [salesByCategory] = await pool.query(`
      SELECT c.name as category, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.menu_item_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `);

    res.json({
      total_sales: totals.total_sales,
      total_revenue: totals.total_revenue,
      sales_by_day: salesByDay,
      top_products: topProducts,
      sales_by_category: salesByCategory
    });
  } catch (err) {
    console.error('Sales analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;