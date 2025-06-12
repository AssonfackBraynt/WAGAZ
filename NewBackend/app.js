require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'WAGAZ Backend is alive 🎉' });
});

// Routes (to be added later)
app.use('/auth', require('./routes/authRoutes'));
app.use('/shops', require('./routes/shopRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/products', require('./routes/productRoutes'));

module.exports = app;
