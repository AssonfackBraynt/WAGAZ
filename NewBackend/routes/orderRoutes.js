const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.post('/', auth, orderController.createOrder);
router.get('/history', auth, orderController.getUserOrders);
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
