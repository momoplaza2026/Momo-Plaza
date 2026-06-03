const express = require('express');
const { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', protect, admin, createRestaurant);
router.put('/:id', protect, admin, updateRestaurant);
router.delete('/:id', protect, admin, deleteRestaurant);

module.exports = router;
