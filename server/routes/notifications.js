const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');

// @route   GET api/notifications
// @desc    Get notifications for a user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const connection = await pool.getConnection();
  
  try {
    let query = 'SELECT * FROM notifications';
    const queryParams = [];

    if (userId) {
      query += ' WHERE user_id = ?';
      queryParams.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const [notifications] = await connection.query(query, queryParams);
    res.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications.' });
  } finally {
    connection.release();
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ message: 'Server error while updating notification.' });
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read for a user
// @access  Private
router.put('/read-all', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ message: 'Server error while updating notifications.' });
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification.' });
  }
});

// @route   GET api/notifications/unread-count
// @desc    Get unread notification count for a user
// @access  Private
router.get('/unread-count', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    
    res.json({ unreadCount: result[0].count });
  } catch (error) {
    console.error('Failed to get unread count:', error);
    res.status(500).json({ message: 'Server error while getting unread count.' });
  }
});

module.exports = router; 