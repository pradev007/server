const express = require('express');
const router = express.Router();
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Get all products for a store
router.get('/:store_id', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM products WHERE store_id = ?';
    connection.query(query, [req.params.store_id], function (error, results, fields) {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get product by ID
router.get('/:store_id/:product_id', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM products WHERE store_id = ? AND product_id = ?';
    connection.query(query, [req.params.store_id, req.params.product_id], function (error, results, fields) {
      if (error) throw error;
      if (results.length) {
        res.json(results[0]);
      } else {
        res.status(404).json({ msg: 'Product not found' });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create product
router.post('/:store_id', authenticateToken, async (req, res) => {
  try {
    const { product_name, description, price, status, image, cat_id } = req.body;
    
    // Insert product into database
    const query = 'INSERT INTO products (product_name, description, price, status, image, cat_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [product_name, description, price, status, image, cat_id, req.params.store_id], function (error, results, fields) {
      if (error) throw error;
      res.json({ msg: 'Product created successfully' });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update product
router.put('/:store_id/:product_id', authenticateToken, async (req, res) => {
  try {
    const { product_name, description, price, status, image, cat_id } = req.body;
    
    // Update product in database
    const query = 'UPDATE products SET product_name = ?, description = ?, price = ?, status = ?, image = ?, cat_id = ? WHERE store_id = ? AND product_id = ?';
    connection.query(query, [product_name, description, price, status, image, cat_id, req.params.store_id, req.params.product_id], function (error, results, fields) {
      if (error) throw error;
      if (results.affectedRows) {
        res.json({ msg: 'Product updated successfully' });
      } else {
        res.status(404).json({ msg: 'Product not found' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const productId = req.params.id;
      const vendorId = req.user.vendor_id; // assuming vendor_id is stored in the token
      
      // Check if the vendor has access to the product
      const query = 'SELECT * FROM products WHERE product_id = ? AND vendor_id = ?';
      connection.query(query, [productId, vendorId], function (error, results, fields) {
        if (error) throw error;
        
        if (results.length) {
          // Delete product from database
          connection.query('DELETE FROM products WHERE product_id = ?', [productId], function (error, results, fields) {
            if (error) throw error;
  
            if (results.affectedRows) {
              res.json({ msg: 'Product deleted successfully' });
            } else {
              res.status(404).json({ msg: 'Product not found' });
            }
          });
        } else {
          res.status(403).json({ msg: 'You are not authorized to delete this product' });
        }
      });
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


module.exports = router;
  