const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY name');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/:id', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role = 'staff', is_active = true } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      is_active
    };

    const [result] = await pool.query('INSERT INTO users SET ?', newUser);
    
    const [createdUser] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json(createdUser[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role, is_active } = req.body;

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];

    // Check if new email conflicts with existing users
    if (email && email !== user.email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Prepare update data
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    };

    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await pool.query('UPDATE users SET ? WHERE id = ?', [updateData, userId]);
    
    const [updatedUser] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [userId]);

    res.json(updatedUser[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    // Check if user exists and what is their role
    const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin users
    if (users[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found during deletion' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;