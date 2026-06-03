const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ isGlobal: true })
            .sort({ createdAt: -1 })
            .limit(50);

        // Add `isRead` field for this user
        const userId = req.user._id;
        const formatted = notifications.map(n => ({
            _id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            image: n.image,
            metadata: n.metadata,
            createdAt: n.createdAt,
            isRead: n.readBy.some(id => id.toString() === userId.toString())
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get unread notification count for the logged-in user
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await Notification.countDocuments({
            isGlobal: true,
            readBy: { $ne: userId }
        });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { readBy: userId }
        });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.updateMany(
            { isGlobal: true, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
