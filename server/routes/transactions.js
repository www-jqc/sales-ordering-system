const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private (Cashier/Admin)
router.post('/', authenticateToken, async (req, res) => {
    const { order_id, payment_method, amount_received, change } = req.body;

    if (!order_id || !payment_method || amount_received === undefined) {
        return res.status(400).json({ message: 'Missing required transaction fields.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [order] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [order_id]);
        if (order.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }

        const newTransaction = {
            order_id,
            payment_method,
            total_amount: order[0].total_amount,
            amount_received,
            change_returned: change,
            user_id: req.user.id // Assumes cashier is logged in
        };

        const [result] = await connection.query('INSERT INTO transactions SET ?', newTransaction);
        
        // Update order payment status
        await connection.query('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?', ['paid', 'paid', order_id]);
        
        await connection.commit();

        const io = req.app.get('socketio');
        io.to('cashier').emit('status_update', { orderId: order_id, status: 'paid' });
        io.to('kitchen').emit('status_update', { orderId: order_id, status: 'paid' });

        res.status(201).json({ success: true, transactionId: result.insertId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Transaction creation failed:', error);
        res.status(500).json({ message: 'Server error while creating transaction.' });
    } finally {
        if (connection) connection.release();
    }
});


// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private (Cashier/Admin)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT t.*, o.customer_name, o.table_id
            FROM transactions t
            JOIN orders o ON t.order_id = o.id
            ORDER BY t.created_at DESC
        `;
        const [transactions] = await pool.query(query);
        res.json(transactions);
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        res.status(500).json({ message: 'Server error while fetching transactions.' });
    }
});

module.exports = router; 