const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// @route   GET /api/menu/items
// @desc    Get all menu items with category
// @access  Public
router.get('/items', async (req, res) => {
  try {
    const query = `
      SELECT mi.*, c.name as category_name 
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      ORDER BY c.name, mi.name
    `;
    const [items] = await pool.query(query);
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/menu/items/:id
// @desc    Get menu item by ID
// @access  Public
router.get('/items/:id', async (req, res) => {
  try {
    const query = `
      SELECT mi.*, c.name as category_name 
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = ?
    `;
    const [items] = await pool.query(query, [req.params.id]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(items[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/menu/items
// @desc    Create new menu item
// @access  Private (Admin only)
router.post('/items', async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available = true } = req.body;
    const newItem = { name, description, price, category_id, image_url, is_available };
    const [result] = await pool.query('INSERT INTO menu_items SET ?', newItem);
    const [insertedItem] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    res.status(201).json(insertedItem[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/menu/items/:id
// @desc    Update menu item
// @access  Private (Admin only)
router.put('/items/:id', async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available } = req.body;
    const itemId = req.params.id;
    
    const [items] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const updatedItem = {
      name: name || items[0].name,
      description: description || items[0].description,
      price: price || items[0].price,
      category_id: category_id || items[0].category_id,
      image_url: image_url || items[0].image_url,
      is_available: is_available !== undefined ? is_available : items[0].is_available
    };

    await pool.query('UPDATE menu_items SET ? WHERE id = ?', [updatedItem, itemId]);
    const [result] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
    res.json(result[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/menu/items/:id
// @desc    Delete menu item
// @access  Private (Admin only)
router.delete('/items/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// CATEGORY ROUTES

// @route   GET /api/menu/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/menu/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/categories', async (req, res) => {
  try {
    const { name, description, is_active = true } = req.body;
    const newCategory = { name, description, is_active };
    const [result] = await pool.query('INSERT INTO categories SET ?', newCategory);
    res.status(201).json({ id: result.insertId, ...newCategory });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/menu/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put('/categories/:id', async (req, res) => {
    try {
        const { name, description, is_active } = req.body;
        await pool.query('UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?', [name, description, is_active, req.params.id]);
        res.json({ message: 'Category updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/menu/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/categories/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        // Handle case where category has menu items
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete category with associated menu items. Please reassign items first.' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 