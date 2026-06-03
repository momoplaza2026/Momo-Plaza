const express = require('express');
const { 
    authUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile, 
    getUsers, 
    subscribeToNotifications, 
    testNotification,
    registerDriver,
    getDrivers,
    updateDriverAvailability
} = require('../controllers/userController');
const { protect, admin, driver } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.post('/subscribe', subscribeToNotifications);
router.post('/test-notification', protect, admin, testNotification);

// Driver management (Admin)
router.route('/drivers')
    .post(protect, admin, registerDriver)
    .get(protect, admin, getDrivers);

// Driver availability (Driver)
router.put('/availability', protect, driver, updateDriverAvailability);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

const User = require('../models/User');

router.route('/cart').put(protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            console.log('Cart Sync: User not found in DB:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Cart Sync: Processing for ${user.email}`);
        const incomingItems = req.body.cartItems || [];
        const currentItems = user.cart || [];
        
        // Use a set of ID strings for efficient comparison
        const currentItemIds = new Set(currentItems.map(i => i.menuItem ? String(i.menuItem) : 'null'));
        
        // Check if we are adding any item that isn't already in the cart AND was added via AI
        const newAIItems = incomingItems.filter(i => {
            const id = i._id || i.id;
            return id && !currentItemIds.has(String(id)) && i.addedViaAI === true;
        });

        const hasNewAIItem = newAIItems.length > 0;
        console.log(`Cart Sync: hasNewAIItem=${hasNewAIItem}, found ${newAIItems.length} new AI items`);

        if (hasNewAIItem) {
            const today = new Date().setHours(0, 0, 0, 0);
            const lastAddDate = user.lastAddItemDate ? new Date(user.lastAddItemDate).setHours(0, 0, 0, 0) : null;

            // Daily limit check: Only 1 new item type per day via AI
            if (lastAddDate === today && (user.dailyAddItemCount || 0) >= 1) {
                console.log('Cart Sync: Daily AI limit blocked addition');
                return res.status(403).json({ 
                    message: "Daily Limit Reached: AI can only recommend 1 new dish per day! 🧞‍♂️ You can still add items manually!",
                    limitReached: true
                });
            }

            // Increment count if it's the same day, otherwise reset to 1
            user.dailyAddItemCount = (lastAddDate === today) ? (user.dailyAddItemCount + 1) : 1;
            user.lastAddItemDate = new Date();
        }

        // Prepare the new cart array, ensuring we have valid IDs and quantities
        // Remove the temporary addedViaAI flag before saving
        const updatedCart = incomingItems
            .filter(item => item && (item._id || item.id))
            .map(item => ({
                menuItem: item._id || item.id,
                quantity: Number(item.qty || 1)
                // Note: addedViaAI flag is only used for daily limit checking, not stored in DB
            }));

        console.log(`Cart Sync: Finalizing cart with ${updatedCart.length} items`);
        user.cart = updatedCart;
        
        await user.save();
        
        // Re-fetch with population to return current availability/details
        const updatedUser = await User.findById(user._id).populate('cart.menuItem');
        
        console.log('Cart Sync: Success');
        res.json({ 
            message: 'Cart synchronized successfully', 
            dailyAddItemCount: updatedUser.dailyAddItemCount,
            lastAddItemDate: updatedUser.lastAddItemDate,
            cart: updatedUser.cart // Return the updated, populated cart
        });
    } catch (err) {
        console.error('Cart Sync 500 Error:', err);
        res.status(500).json({ 
            message: 'Server error during cart sync', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;
