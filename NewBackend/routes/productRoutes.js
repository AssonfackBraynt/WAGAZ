const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Gas Bottles
router.post('/gas-bottles', auth, productController.addGasBottle);
router.get('/gas-bottles/:shop_id', auth, productController.getGasBottlesByShop);
router.put('/gas-bottles/:id', auth, productController.updateGasBottle);

// Shop Products
router.post('/shop-products', auth, productController.addShopProduct);
router.get('/shop-products/:shop_id', auth,productController.getShopProductsByShop);
router.put('/shop-products/:id', auth, productController.updateShopProduct);

// Fuel Inventory
router.post('/fuel', auth, productController.addFuelInventory);
router.put('/fuel/:id', auth, productController.updateFuelInventory);

// Retriving products
// router.get('/gas-bottles', productController.getGasBottlesByShop);
router.get('/fuel', productController.getFuelInventoryByShop);


module.exports = router;
