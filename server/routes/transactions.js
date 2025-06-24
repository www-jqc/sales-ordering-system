const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// @route   POST /api/transactions
// @desc    Create a new payment transaction following the corrected flow
// @access  Private (Cashier/Admin)
router.post('/', authenticateToken, async (req, res) => {
    const { order_id, payment_method, amount_received, change } = req.body;

    if (!order_id || !payment_method || amount_received === undefined) {
        return res.status(400).json({ message: 'Missing required transaction fields.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get order details
        const [order] = await connection.query(`
            SELECT o.*, c.first_name, c.last_name, t.table_number
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN tables t ON o.table_id = t.table_id
            WHERE o.order_id = ?
        `, [order_id]);
        
        if (order.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }

        const orderData = order[0];

        // Create payment transaction with corrected schema
        const newTransaction = {
            order_id,
            payment_method: payment_method.toUpperCase(),
            total_amount: orderData.total_amount,
            amount_received,
            change_amount: change || 0,
            status: 'COMPLETED',
            cashier_id: req.user.id // Assumes cashier is logged in
        };

        const [transactionResult] = await connection.query('INSERT INTO payment_transactions SET ?', newTransaction);
        const transactionId = transactionResult.insertId;
        
        // Update order status to PAID and set processed_by_id
        await connection.query(
            'UPDATE orders SET status = ?, paid_at = CURRENT_TIMESTAMP, processed_by_id = ? WHERE order_id = ?', 
            ['PAID', req.user.id, order_id]
        );

        // Create sales record
        const salesData = {
            order_id,
            payment_transaction_id: transactionId,
            date: new Date().toISOString().split('T')[0],
            total_revenue: orderData.total_amount,
            cash_revenue: payment_method.toUpperCase() === 'CASH' ? orderData.total_amount : 0,
            gcash_revenue: payment_method.toUpperCase() === 'GCASH' ? orderData.total_amount : 0,
            processed_by_id: req.user.id
        };

        await connection.query('INSERT INTO sales SET ?', salesData);

        // Create notification
        await connection.query(
            'INSERT INTO notifications (order_id, message, message_type) VALUES (?, ?, ?)',
            [order_id, `Payment completed for order #${order_id}`, 'PAYMENT']
        );

        await connection.commit();

        // Emit WebSocket events following the corrected flow
        const io = req.app.get('socketio');
        const updateData = { 
            orderId: order_id, 
            status: 'PAID', 
            order: { ...orderData, status: 'PAID' }
        };

        // Emit order_paid event to kitchen
        io.to('kitchen').emit('order_paid', { ...orderData, status: 'PAID' });
        io.to('cashier').emit('status_update', updateData);
        io.to(`table_${orderData.table_id}`).emit('status_update', updateData);

        res.status(201).json({ 
            success: true, 
            transactionId: transactionId,
            message: 'Payment completed successfully'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Transaction creation failed:', error);
        res.status(500).json({ message: 'Server error while creating transaction.' });
    } finally {
        if (connection) connection.release();
    }
});

// @route   GET /api/transactions
// @desc    Get all transactions (sales)
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT s.id, s.order_id, o.customer_name, o.table_id, o.total_amount,
             u.name as cashier_name, s.payment_method, s.amount_paid, s.change_amount, s.transaction_date
      FROM sales s
      JOIN orders o ON s.order_id = o.id
      LEFT JOIN users u ON s.cashier_id = u.id
      ORDER BY s.transaction_date DESC
    `);
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/sales-report
// @desc    Get sales report with revenue breakdown
// @access  Private (Admin)
router.get('/sales-report', authenticateToken, async (req, res) => {
    const { start_date, end_date } = req.query;
    
    try {
        let query = `
            SELECT 
                s.date,
                COUNT(s.sale_id) as total_orders,
                SUM(s.total_revenue) as total_revenue,
                SUM(s.cash_revenue) as cash_revenue,
                SUM(s.gcash_revenue) as gcash_revenue
            FROM sales s
        `;
        
        const queryParams = [];
        if (start_date && end_date) {
            query += ' WHERE s.date BETWEEN ? AND ?';
            queryParams.push(start_date, end_date);
        }
        
        query += ' GROUP BY s.date ORDER BY s.date DESC';
        
        const [salesReport] = await pool.query(query, queryParams);
        res.json(salesReport);
    } catch (error) {
        console.error('Failed to fetch sales report:', error);
        res.status(500).json({ message: 'Server error while fetching sales report.' });
    }
});

module.exports = router; 