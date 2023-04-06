const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Login
router.post('/login', async (req, res) => {
  try {
    const { ven_email, password } = req.body;

    // Check if vendor exists
    const query = 'SELECT * FROM vendor WHERE ven_email = ?';
    connection.query(query, [ven_email], async function (error, results, fields) {
      if (error) throw error;
      if (results.length) {
        const vendor = results[0];
        
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (isMatch) {
          
          // Create JWT token
          const token = jwt.sign({ id: vendor.ven_id }, process.env.JWT_SECRET);

          // Send token as response
          res.json({ token });
        } else {
          res.status(400).json({ msg: 'Invalid credentials' });
        }
      } else {
        res.status(400).json({ msg: 'Invalid credentials' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Get all vendors
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM vendor';
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get vendor by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM vendor WHERE ven_id = ?';
    connection.query(query, [req.params.id], function (error, results, fields) {
      if (error) throw error;
      if (results.length) {
        res.json(results[0]);
      } else {
        res.status(404).json({ msg: 'Vendor not found' });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create vendor
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { ven_name, password, ven_email, ven_contact } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert vendor into database
    const query = 'INSERT INTO vendor (ven_name, password, ven_email, ven_contact) VALUES (?, ?, ?, ?)';
    connection.query(query, [ven_name, hashedPassword, ven_email, ven_contact], function (error, results, fields) {
      if (error) throw error;
      res.json({ msg: 'Vendor created successfully' });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update vendor
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { ven_name, password, ven_email, ven_contact } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update vendor in database
    const query = 'UPDATE vendor SET ven_name = ?, password = ?, ven_email = ?, ven_contact = ? WHERE ven_id = ?';
    connection.query(query, [ven_name, hashedPassword, ven_email, ven_contact, req.params.id], function (error, results, fields) {
      if (error) throw error;
      if (results.affectedRows) {
        res.json({ msg: 'Vendor updated successfully' });
      } else {
        res.status(404).json({ msg: 'Vendor not found' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete vendor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Delete vendor from database
    connection.query('DELETE FROM vendor WHERE ven_id = ?', [req.params.id], function (error, results, fields) {
      if (error) throw error;

      if (results.affectedRows) {
        res.json({ msg: 'Vendor deleted successfully' });
      } else {
        res.status(404).json({ msg: 'Vendor not found' });
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
