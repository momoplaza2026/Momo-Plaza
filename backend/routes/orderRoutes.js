const express = require('express');
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    assignDriverToOrder,
    getDriverOrders,
    deleteOrder
} = require('../controllers/orderController');
const { protect, admin, driver } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/', protect, admin, getOrders);
router.get('/myorders', protect, getMyOrders);

// Driver specific routes
router.get('/driver/myorders', protect, driver, getDriverOrders);
router.put('/:id/assign', protect, admin, assignDriverToOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
// Also allow driver to update status
router.put('/:id/driver/status', protect, driver, updateOrderStatus);

router.get('/:id', protect, getOrderById);
router.delete('/:id', protect, admin, deleteOrder);
router.put('/:id/pay', protect, updateOrderToPaid);

module.exports = router;
