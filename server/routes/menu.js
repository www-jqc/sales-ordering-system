const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// CATEGORY ROUTES

// @route   GET /api/menu/categories/all
// @desc    Get all active categories for dropdowns
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT id, name FROM categories WHERE is_active = 1 ORDER BY name');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/menu/categories
// @desc    Get all categories with pagination
// @access  Private (Admin)
router.get('/categories', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams = [];

    if (search) {
      whereClause = 'WHERE name LIKE ? OR description LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM categories ${whereClause}`;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    const dataQuery = `
      SELECT *, (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as product_count
      FROM categories
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [categories] = await pool.query(dataQuery, queryParams);

    res.json({
      items: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      }
    });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   POST /api/menu/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/categories', async (req, res) => {
  try {
    const { name, description, is_active = true } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
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
        
        if (!name) {
          return res.status(400).json({ message: 'Category name is required' });
        }
        
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

// @route   GET /api/menu
// @desc    Get all menu items with category (with pagination and search)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category_id = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const queryParams = [];

    // Search functionality
    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Category filter
    if (category_id) {
      conditions.push('p.category_id = ?');
      queryParams.push(category_id);
    }

    // Status filter (available/unavailable)
    if (status !== '') {
      conditions.push('p.is_available = ?');
      queryParams.push(status === 'true' ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total records for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // Main query with pagination
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    const [items] = await pool.query(query, queryParams);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        limit: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while fetching menu' });
  }
});

// @route   GET /api/menu/admin
// @desc    Get all menu items for admin (including unavailable items)
// @access  Private (Admin only)
router.get('/admin', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category_id = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const queryParams = [];

    // Search functionality
    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Category filter
    if (category_id) {
      conditions.push('p.category_id = ?');
      queryParams.push(category_id);
    }

    // Status filter (available/unavailable)
    if (status !== '') {
      conditions.push('p.is_available = ?');
      queryParams.push(status === 'true' ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total records for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // Main query with pagination
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    const [items] = await pool.query(query, queryParams);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        limit: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while fetching menu' });
  }
});

// @route   GET /api/menu/:id
// @desc    Get menu item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
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

// @route   POST /api/menu
// @desc    Create new menu item
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available = true } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const newItem = { name, description, price, category_id, image_url, is_available };
    const [result] = await pool.query('INSERT INTO products SET ?', newItem);
    
    // Fetch the created item with category name
    const [insertedItem] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [result.insertId]);
    
    res.status(201).json(insertedItem[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, is_available } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const updateData = { name, description, price, category_id, image_url, is_available };
    
    const [result] = await pool.query('UPDATE products SET ? WHERE id = ?', [updateData, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Fetch the updated item with category name
    const [updatedItem] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    res.json(updatedItem[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/menu/:id/availability
// @desc    Update menu item availability
// @access  Private (Admin only)
router.put('/:id/availability', async (req, res) => {
  try {
    const { is_available } = req.body;
    const { id } = req.params;

    if (is_available === undefined) {
      return res.status(400).json({ message: 'Missing is_available flag.' });
    }

    await pool.query('UPDATE products SET is_available = ? WHERE id = ?', [is_available, id]);
    
    // Broadcast this change to all customers
    const io = req.app.get('socketio');
    io.emit('menu_item_updated', { productId: parseInt(id, 10), is_available });

    res.json({ success: true, message: 'Availability updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete product because it is part of existing orders. Please deactivate it instead.' });
    }
    console.error(err.message);
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
});

module.exports = router; 