const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connection } = require('../configs');

const authenticateToken  = require('../authenticate');

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, user_id, cat_id, ven_id } = req.body;
    
    // Check if admin with this email already exists
    connection.query('SELECT * FROM admin WHERE email = ?', [email], async (error, results) => {
      if (error) throw error;
      
      if (results.length) {
        return res.status(400).json({ msg: 'Admin already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert admin into database
      connection.query('INSERT INTO admin (name, email, password, user_id, cat_id, ven_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, user_id, cat_id, ven_id], async (error, results) => {
          if (error) throw error;
          
          // Generate JWT token
          const payload = { admin: { id: email } };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 1 day
          res.json({ token });
        });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin with this email exists
    connection.query('SELECT * FROM admin WHERE email = ?', [email], async (error, results) => {
      if (error) throw error;
      
      if (!results.length) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
      
      // Check if password is correct
      const isMatch = await bcrypt.compare(password, results[0].password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
      
      // Generate JWT token
      const payload = { admin: { id: email } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 1 day
      res.json({ token });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Read all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    connection.query('SELECT * FROM users', async (error, results) => {
      if (error) throw error;
      
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Read a single user
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    connection.query('SELECT * FROM users WHERE user_id = ?', [id], function (error, results, fields) {
      if (error) throw error;
      if (!results.length) {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.json(results[0]);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a user
router.post('/users', authenticateToken, async (req, res) => {
  try {
    const { user_dob, user_address, user_contact, user_email, user_name, password } = req.body;
    
    // Check if user with this email already exists
    connection.query('SELECT * FROM users WHERE user_email = ?', [user_email], async function (error, results, fields) {
      if (error) throw error;
      if (results.length) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user into database
      connection.query('INSERT INTO users (user_dob, user_address, user_contact, user_email, user_name, password) VALUES (?, ?, ?, ?, ?, ?)',
        [user_dob, user_address, user_contact, user_email, user_name, hashedPassword], function (error, results, fields) {
          if (error) throw error;
          res.status(201).send('User created successfully');
        });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a user
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_dob, user_address, user_contact, user_email, user_name } = req.body;
    
    // Check if user exists
    connection.query('SELECT * FROM users WHERE user_id = ?', [id], async function (error, results, fields) {
      if (error) throw error;
      if (!results.length) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Update user in database
      connection.query('UPDATE users SET user_dob = ?, user_address = ?, user_contact = ?, user_email = ?, user_name = ? WHERE user_id = ?',
        [user_dob, user_address, user_contact, user_email, user_name, id], function (error, results, fields) {
          if (error) throw error;
          res.send('User updated successfully');
        });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// Delete user
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user with this id exists
    connection.query('SELECT * FROM users WHERE user_email = ?', [req.params.id], function (error, results, fields) {
      if (error) throw error;
      if (!results.length) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Delete user from database
      connection.query('DELETE FROM users WHERE user_email = ?', [req.params.id], function (error, results, fields) {
        if (error) throw error;
        res.json({ msg: 'User deleted successfully' });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;