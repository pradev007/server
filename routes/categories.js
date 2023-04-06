const express = require('express');
const router = express.Router();
const connection = require('../configs');
const authenticateToken = require('../authenticate');

// Get all categories
router.get('/', async (req, res) => {
  try {
    connection.query('SELECT * FROM categories', function (error, categories) {
      if (error) throw error;
      res.json(categories);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get category by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    connection.query('SELECT * FROM categories WHERE cat_id = ?', [id], function (error, category) {
      if (error) throw error;
      if (!category.length) {
        return res.status(404).json({ msg: 'Category not found' });
      }
      res.json(category[0]);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    connection.query('INSERT INTO categories (type) VALUES (?)', [type], function (error, results) {
      if (error) throw error;
      res.json({ msg: 'Category created' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    connection.query('UPDATE categories SET type = ? WHERE cat_id = ?', [type, id], function (error, results) {
      if (error) throw error;
      res.json({ msg: 'Category updated' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    connection.query('DELETE FROM categories WHERE cat_id = ?', [id], function (error, results) {
      if (error) throw error;
      res.json({ msg: 'Category deleted' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
