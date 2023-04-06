const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'furniture'
});

const users = require('./routes/users');
const admin = require('./routes/admin');
const order = require('./routes/order');
const vendors = require('./routes/vendors');
const categories = require('./routes/categories');
const stores = require('./routes/stores');
const products = require('./routes/products');
const carts = require('./routes/carts');
const payments = require('./routes/payments');


app.use('/users', users);
app.use('/admin', admin);
app.use('/orders', order);
app.use('/vendors', vendors);
app.use('/categories', categories);
app.use('/stores', stores);
app.use('/products', products);
app.use('/carts', carts);
app.use('/payments', payments);

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
