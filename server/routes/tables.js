const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { pool } = require('../config/database');

// @route   GET /api/tables
// @desc    Get all tables
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [tables] = await pool.query('SELECT * FROM tables ORDER BY table_number ASC');
    res.json(tables);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tables/:id
// @desc    Get table by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const [tables] = await pool.query('SELECT * FROM tables WHERE id = ?', [req.params.id]);
    if (tables.length === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(tables[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tables
// @desc    Create new table
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { table_number, status = 'available', capacity = 4 } = req.body;

    // --- Validation ---
    if (!table_number) {
      return res.status(400).json({ message: 'Table number is required.' });
    }
    const parsedTableNumber = parseInt(table_number, 10);
    if (isNaN(parsedTableNumber) || parsedTableNumber <= 0) {
        return res.status(400).json({ message: 'Please provide a valid table number.' });
    }
    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ message: 'Please provide a valid capacity.' });
    }
    // --- End Validation ---

    await connection.beginTransaction();

    // Check if table number already exists
    const [existingTables] = await connection.query('SELECT id FROM tables WHERE table_number = ?', [parsedTableNumber]);
    if (existingTables.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'A table with this number already exists.' });
    }

    // Generate QR code URL
    const host = process.env.QR_CODE_BASE_URL || `http://localhost:3000/menu`;
    const qrCodeUrl = `${host}/${parsedTableNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const newTable = {
      table_number: parsedTableNumber,
      status: status,
      capacity: parsedCapacity,
      qr_code: qrCodeDataUrl
    };

    const [result] = await connection.query('INSERT INTO tables SET ?', newTable);
    const [insertedTable] = await connection.query('SELECT * FROM tables WHERE id = ?', [result.insertId]);
    
    await connection.commit();

    res.status(201).json(insertedTable[0]);
  } catch (err) {
    if(connection) await connection.rollback();
    console.error(err.message);
    res.status(500).json({ message: 'Server error occurred while creating the table.' });
  } finally {
    if (connection) connection.release();
  }
});

// @route   PUT /api/tables/:id
// @desc    Update table
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { table_number, status, capacity } = req.body;
    const tableId = req.params.id;

    await connection.beginTransaction();

    const [tables] = await connection.query('SELECT * FROM tables WHERE id = ?', [tableId]);
    if (tables.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check for conflicts if table_number is being changed
    let parsedTableNumber = tables[0].table_number;
    if (table_number && table_number.toString() !== tables[0].table_number.toString()) {
      parsedTableNumber = parseInt(table_number, 10);
      if (isNaN(parsedTableNumber) || parsedTableNumber <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Please provide a valid table number.' });
      }
      const [existing] = await connection.query('SELECT id FROM tables WHERE table_number = ? AND id != ?', [parsedTableNumber, tableId]);
      if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: 'Table number is already in use by another table.' });
      }
    }
    
    // Validate capacity
    let parsedCapacity = tables[0].capacity;
    if (capacity !== undefined) {
      parsedCapacity = parseInt(capacity, 10);
      if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Please provide a valid capacity.' });
      }
    }

    // Generate QR code URL
    const host = process.env.QR_CODE_BASE_URL || `http://localhost:3000/menu`;
    const qrCodeUrl = `${host}/${parsedTableNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const updatedTable = {
      table_number: parsedTableNumber,
      status: status || tables[0].status,
      capacity: parsedCapacity,
      qr_code: qrCodeDataUrl
    };

    await connection.query('UPDATE tables SET ? WHERE id = ?', [updatedTable, tableId]);
    await connection.commit();

    const [result] = await connection.query('SELECT * FROM tables WHERE id = ?', [tableId]);
    res.json(result[0]);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err.message);
    res.status(500).json({ message: 'Server error occurred while updating the table.' });
  } finally {
    if (connection) connection.release();
  }
});

// @route   DELETE /api/tables/:id
// @desc    Delete table
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tables WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tables/:id/qr-code
// @desc    Generate QR code for table
// @access  Private (Admin only)
router.get('/:id/qr-code', async (req, res) => {
  try {
    const [tables] = await pool.query('SELECT * FROM tables WHERE id = ?', [req.params.id]);
    if (tables.length === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }
    const table = tables[0];
    
    // Use the correct environment variable from the user's .env file
    const host = process.env.QR_CODE_BASE_URL || `http://localhost:3000/menu`;
    
    // --- DEBUGGING LINE ---
    console.log(`[QR Code Gen] Using base URL: ${host}`);
    
    const qrCodeUrl = `${host}/${table.id}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    await pool.query('UPDATE tables SET qr_code = ? WHERE id = ?', [qrCodeDataUrl, table.id]);

    res.json({
      table_id: table.id,
      table_number: table.table_number,
      qr_code_url: qrCodeUrl,
      qr_code_data: qrCodeDataUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 