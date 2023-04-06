const express = require('express');
const router = express.Router();
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM stores';
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM stores WHERE store_id = ?';
    connection.query(query, [req.params.id], function (error, results, fields) {
      if (error) throw error;
      if (results.length) {
        res.json(results[0]);
      } else {
        res.status(404).json({ msg: 'Store not found' });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create store
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { store_name, store_logo, status, ven_id } = req.body;
    
    // Insert store into database
    const query = 'INSERT INTO stores (store_name, store_logo, status, ven_id) VALUES (?, ?, ?, ?)';
    connection.query(query, [store_name, store_logo, status, ven_id], function (error, results, fields) {
      if (error) throw error;
      res.json({ msg: 'Store created successfully' });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update store
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { store_name, store_logo, status, ven_id } = req.body;
    
    // Update store in database
    const query = 'UPDATE stores SET store_name = ?, store_logo = ?, status = ?, ven_id = ? WHERE store_id = ?';
    connection.query(query, [store_name, store_logo, status, ven_id, req.params.id], function (error, results, fields) {
      if (error) throw error;
      if (results.affectedRows) {
        res.json({ msg: 'Store updated successfully' });
      } else {
        res.status(404).json({ msg: 'Store not found' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete store
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Delete store from database
    connection.query('DELETE FROM stores WHERE store_id = ?', [req.params.id], function (error, results, fields) {
      if (error) throw error;

      if (results.affectedRows) {
        res.json({ msg: 'Store deleted successfully' });
      } else {
        res.status(404).json({ msg: 'Store not found' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
