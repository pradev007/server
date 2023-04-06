const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Create cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, product_id, cart_code, quantity, cost, total_cost } = req.body;
    
    // Insert cart into database
    const query = 'INSERT INTO carts (user_id, product_id, cart_code, quantity, cost, total_cost) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [user_id, product_id, cart_code, quantity, cost, total_cost], function (error, results, fields) {
      if (error) throw error;
      res.json({ msg: 'Cart created successfully' });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id; // assuming user_id is stored in the token
    const query = 'SELECT * FROM carts WHERE user_id = ?';
    connection.query(query, [user_id], function (error, results, fields) {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update cart
router.put('/:cart_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, product_id, cart_code, quantity, cost, total_cost } = req.body;
    const cartId = req.params.cart_id;
    
    // Update cart in database
    const query = 'UPDATE carts SET user_id = ?, product_id = ?, cart_code = ?, quantity = ?, cost = ?, total_cost = ? WHERE cart_id = ?';
    connection.query(query, [user_id, product_id, cart_code, quantity, cost, total_cost, cartId], function (error, results, fields) {
      if (error) throw error;
      if (results.affectedRows) {
        res.json({ msg: 'Cart updated successfully' });
      } else {
        res.status(404).json({ msg: 'Cart not found' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete cart item
router.delete('/:cart_id', authenticateToken, async (req, res) => {
    try {
      const cartId = req.params.cart_id;
      const userId = req.user.user_id; // assuming user_id is stored in the token
      
      // Check if the user has access to the cart item
      const query = 'SELECT * FROM carts WHERE cart_id = ? AND user_id = ?';
      connection.query(query, [cartId, userId], function (error, results, fields) {
        if (error) throw error;
        
        if (results.length) {
          // Delete cart item from database
          connection.query('DELETE FROM carts WHERE cart_id = ?', [cartId], function (error, results, fields) {
            if (error) throw error;
  
            if (results.affectedRows) {
              res.json({ msg: 'Cart item deleted successfully' });
            } else {
              res.status(404).json({ msg: 'Cart item not found' });
            }
          });
        } else {
          res.status(403).json({ msg: 'You are not authorized to delete this cart item' });
        }
      });
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  module.exports = router;