const express = require('express');
const router = express.Router();
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    connection.query('SELECT * FROM orders WHERE user_id = ?', [req.user.id], (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get order details for a specific order
router.get('/:order_id', authenticateToken, async (req, res) => {
  try {
    connection.query('SELECT * FROM order_details WHERE order_id = ?', [req.params.order_id], (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity, total_cost } = req.body;
    connection.query('INSERT INTO orders (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id], (error, result, fields) => {
      if (error) throw error;
      const order_id = result.insertId;
      connection.query('INSERT INTO order_details (order_id, quantity, total_cost) VALUES (?, ?, ?)', [order_id, quantity, total_cost], (error, result, fields) => {
        if (error) throw error;
        res.json({ msg: 'Order created successfully' });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update an existing order
router.put('/:order_id', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity, total_cost } = req.body;
    connection.query('UPDATE orders SET product_id = ? WHERE order_id = ? AND user_id = ?', [product_id, req.params.order_id, req.user.id], (error, result, fields) => {
      if (error) throw error;
      connection.query('UPDATE order_details SET quantity = ?, total_cost = ? WHERE order_id = ?', [quantity, total_cost, req.params.order_id], (error, result, fields) => {
        if (error) throw error;
        res.json({ msg: 'Order updated successfully' });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete an existing order
router.delete('/:order_id', authenticateToken, async (req, res) => {
  try {
    connection.query('DELETE FROM orders WHERE order_id = ? AND user_id = ?', [req.params.order_id, req.user.id], (error, result, fields) => {
      if (error) throw error;
      connection.query('DELETE FROM order_details WHERE order_id = ?', [req.params.order_id], (error, result, fields) => {
        if (error) throw error;
        res.json({ msg: 'Order deleted successfully' });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
