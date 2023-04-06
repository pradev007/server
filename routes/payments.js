const express = require('express');
const router = express.Router();
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    connection.query('SELECT * FROM payments WHERE user_id = ?', [req.user.id], (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get payment details for a specific payment
router.get('/:payment_id', authenticateToken, async (req, res) => {
  try {
    connection.query('SELECT * FROM payments WHERE payment_id = ?', [req.params.payment_id], (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a new payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { payment_amt, payment_type, payment_date, payment_status, order_id } = req.body;
    connection.query('INSERT INTO payments (payment_amt, payment_type, payment_date, payment_status, order_id, user_id) VALUES (?, ?, ?, ?, ?, ?)', [payment_amt, payment_type, payment_date, payment_status, order_id, req.user.id], (error, result, fields) => {
      if (error) throw error;
      res.json({ msg: 'Payment created successfully' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update an existing payment
router.put('/:payment_id', authenticateToken, async (req, res) => {
  try {
    const { payment_amt, payment_type, payment_date, payment_status, order_id } = req.body;
    connection.query('UPDATE payments SET payment_amt = ?, payment_type = ?, payment_date = ?, payment_status = ?, order_id = ? WHERE payment_id = ? AND user_id = ?', [payment_amt, payment_type, payment_date, payment_status, order_id, req.params.payment_id, req.user.id], (error, result, fields) => {
      if (error) throw error;
      res.json({ msg: 'Payment updated successfully' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete an existing payment
router.delete('/:payment_id', authenticateToken, async (req, res) => {
  try {
    connection.query('DELETE FROM payments WHERE payment_id = ? AND user_id = ?', [req.params.payment_id, req.user.id], (error, result, fields) => {
      if (error) throw error;
      res.json({ msg: 'Payment deleted successfully' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
