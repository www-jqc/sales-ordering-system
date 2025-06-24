const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    connection.release();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/', [authenticateToken, authorizeAdmin], async (req, res) => {
  const { name, description, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO categories (name, description, is_active) VALUES (?, ?, ?)',
      [name, description || '', is_active !== undefined ? is_active : true]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      name,
      description: description || '',
      is_active: is_active !== undefined ? is_active : true
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put('/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Check if category exists
    const [existing] = await connection.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for duplicate name (excluding current category)
    const [duplicate] = await connection.query(
      'SELECT * FROM categories WHERE name = ? AND id != ?',
      [name, id]
    );

    if (duplicate.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Category name already exists' });
    }

    await connection.query(
      'UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description || '', is_active !== undefined ? is_active : true, id]
    );

    const [updated] = await connection.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    connection.release();
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    
    // Check if category exists
    const [existing] = await connection.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used by any menu items
    const [menuItems] = await connection.query(
      'SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?',
      [id]
    );

    if (menuItems[0].count > 0) {
      connection.release();
      return res.status(400).json({ 
        message: 'Cannot delete category. It is being used by menu items.' 
      });
    }

    await connection.query('DELETE FROM categories WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get a specific category
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    connection.release();

    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 