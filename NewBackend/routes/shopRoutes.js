const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

// Get nearby shops
router.get('/nearby', shopController.getNearbyShops);

//Search for shops
router.get('/search', shopController.searchShops);

// Get single shop by ID
router.get('/:id', shopController.getShopDetails);

// Create new shop (partner only)
router.post('/', auth, shopController.createShop);

module.exports = router;
