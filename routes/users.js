const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../configs');

// Register User
router.post('/register', async (req, res) => {
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

          // Generate JWT token
          // const payload = { user: { id: user_email } };
          // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 1 day
          // res.json({ token });

          res.json(message = "User Register Successfully")
        });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { user_email, password } = req.body;

    // Check if user with this email exists
    connection.query('SELECT * FROM users WHERE user_email = ?', [user_email], async function (error, results, fields) {
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
      // const payload = { user: { id: user_email } };
      // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 1 day
      // res.json({ token });
      res.json({message: "Login Success"})
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
