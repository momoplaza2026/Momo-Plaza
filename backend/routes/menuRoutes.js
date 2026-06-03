const express = require('express');
const { getMenuItems, getAdminMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(getMenuItems).post(protect, admin, createMenuItem);
router.route('/admin/all').get(protect, admin, getAdminMenuItems);
router.route('/:id')
    .put(protect, admin, updateMenuItem)
    .delete(protect, admin, deleteMenuItem);

router.route('/:id/toggle').patch(protect, admin, toggleMenuItemAvailability);

module.exports = router;
