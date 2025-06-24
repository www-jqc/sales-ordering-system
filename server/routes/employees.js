const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// @route   GET /api/employees
// @desc    Get all employees (including non-system employees)
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT * FROM employees ORDER BY created_at DESC
    `);
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Add a new employee (user_id can be NULL)
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, gender = null, position, hire_date, salary = null, is_active = 1 } = req.body;
    if (!name || !position || !hire_date) {
      return res.status(400).json({ message: 'Please provide name, position, and hire_date.' });
    }
    const newEmployee = {
      name,
      gender,
      position,
      hire_date,
      salary,
      is_active
    };
    const [result] = await pool.query('INSERT INTO employees SET ?', newEmployee);
    const [created] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee info
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const empId = req.params.id;
    const { name, gender = null, position, hire_date, salary = null, is_active = 1 } = req.body;
    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [empId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const updateData = {
      name,
      gender,
      position,
      hire_date,
      salary,
      is_active
    };
    await pool.query('UPDATE employees SET ? WHERE id = ?', [updateData, empId]);
    const [updated] = await pool.query('SELECT * FROM employees WHERE id = ?', [empId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const empId = req.params.id;
    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [empId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await pool.query('DELETE FROM employees WHERE id = ?', [empId]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 