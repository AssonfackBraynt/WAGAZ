const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Gas Bottles
router.post('/gas-bottles', auth, productController.addGasBottle);
router.put('/gas-bottles/:id', auth, productController.updateGasBottle);

// Shop Products
router.post('/shop-products', auth, productController.addShopProduct);
router.put('/shop-products/:id', auth, productController.updateShopProduct);

// Fuel Inventory
router.post('/fuel', auth, productController.addFuelInventory);
router.put('/fuel/:id', auth, productController.updateFuelInventory);

// Retriving products
// router.get('/gas-bottles/:shopId', productController.getGasBottlesByShopId);
router.get('/gas-bottles', productController.getGasBottlesByShop);
router.get('/shop-products', productController.getShopProductsByShop);
router.get('/fuel', productController.getFuelInventoryByShop);


module.exports = router;
