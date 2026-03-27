const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

router.post('/', orderController.createOrder); // No auth needed for customers
router.get('/', authMiddleware, orderController.getOrders);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.get('/dashboard', authMiddleware, orderController.getDashboardStats);
router.get('/analytics', authMiddleware, orderController.getAnalytics);
router.get('/:id/bill', orderController.getOrderBill); // Available to client without auth initially for their active session, or auth if strictly required. Currently client views without auth.

module.exports = router;
