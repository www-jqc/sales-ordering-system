const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.query('SELECT COUNT(id) as count FROM users');
    const [tables] = await connection.query('SELECT COUNT(id) as count FROM tables');
    const [menuItems] = await connection.query('SELECT COUNT(id) as count FROM menu_items');

    const [todayOrders] = await connection.query("SELECT COUNT(id) as count, SUM(total_amount) as revenue FROM orders WHERE DATE(created_at) = CURDATE() AND status = 'completed'");
    const [pendingOrders] = await connection.query("SELECT COUNT(id) as count FROM orders WHERE status = 'pending'");
    const [completedOrders] = await connection.query("SELECT COUNT(id) as count FROM orders WHERE status = 'completed'");
    
    const [weeklyRevenue] = await connection.query("SELECT SUM(total_amount) as revenue FROM orders WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) AND status = 'completed'");
    const [monthlyRevenue] = await connection.query("SELECT SUM(total_amount) as revenue FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'completed'");

    connection.release();

    res.json({
      totalUsers: users[0].count,
      totalTables: tables[0].count,
      totalMenuItems: menuItems[0].count,
      todayOrders: todayOrders[0].count || 0,
      todayRevenue: todayOrders[0].revenue || 0,
      pendingOrders: pendingOrders[0].count,
      completedOrders: completedOrders[0].count,
      weeklyRevenue: weeklyRevenue[0].revenue || 0,
      monthlyRevenue: monthlyRevenue[0].revenue || 0,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/sales
// @desc    Get sales reports
// @access  Private (Admin only)
router.get('/reports/sales', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    let dateFilter = '';
    
    if (period === 'daily') {
      dateFilter = 'DATE(o.created_at) = CURDATE()';
    } else if (period === 'weekly') {
      dateFilter = 'YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (period === 'monthly') {
      dateFilter = 'MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())';
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = `DATE(o.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
        return res.status(400).json({ message: 'Invalid period specified.' });
    }

    const salesQuery = `
        SELECT
            SUM(oi.subtotal) as totalSales,
            COUNT(DISTINCT o.id) as totalOrders
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE ${dateFilter} AND o.status = 'completed'
    `;

    const topSellingQuery = `
        SELECT 
            mi.name,
            SUM(oi.quantity) as totalQuantity,
            SUM(oi.subtotal) as totalRevenue
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        JOIN orders o ON oi.order_id = o.id
        WHERE ${dateFilter} AND o.status = 'completed'
        GROUP BY mi.id, mi.name
        ORDER BY totalRevenue DESC
        LIMIT 5
    `;

    const salesByHourQuery = `
        SELECT 
            HOUR(o.created_at) as hour,
            SUM(oi.subtotal) as totalSales
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE ${dateFilter} AND o.status = 'completed'
        GROUP BY HOUR(o.created_at)
        ORDER BY hour
    `;

    const connection = await pool.getConnection();
    const [salesResult] = await connection.query(salesQuery);
    const [topSellingItems] = await connection.query(topSellingQuery);
    const [salesByHour] = await connection.query(salesByHourQuery);
    connection.release();

    const totalSales = salesResult[0].totalSales || 0;
    const totalOrders = salesResult[0].totalOrders || 0;

    res.json({
        period,
        startDate,
        endDate,
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0,
        topSellingItems,
        salesByHour,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/orders
// @desc    Get order reports
// @access  Private (Admin only)
router.get('/reports/orders', [authenticateToken, authorizeAdmin], (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    // This part remains mock data as a full implementation is complex
    res.json({
      message: "Order report endpoint is a placeholder.",
      //...mock data
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 