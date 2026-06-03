const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Get all users with their cart data and complete order history
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ isDriver: { $ne: true }, isAdmin: { $ne: true } })
            .select('-password')
            .populate('cart.menuItem');

        // Enhance user data with cart calculations and complete order history
        const usersWithCompleteData = await Promise.all(
            users.map(async (user) => {
                // Calculate cart totals
                const cartItems = user.cart || [];
                const totalCartItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                
                // Calculate total cart value
                let totalCartPrice = 0;
                for (const item of cartItems) {
                    if (item.menuItem && item.menuItem.price) {
                        totalCartPrice += item.menuItem.price * item.quantity;
                    }
                }

                // Get all orders for this user with full details
                const userOrders = await Order.find({ user: user._id })
                    .sort({ createdAt: -1 })
                    .populate('user', 'name email');
                
                // Get order count
                const orderCount = userOrders.length;
                
                // Get total spent by user
                const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
                
                // Get order status breakdown
                const orderStatusBreakdown = await Order.aggregate([
                    { $match: { user: user._id } },
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]);
                
                // Get recent orders (last 5)
                const recentOrders = userOrders.slice(0, 5).map(order => ({
                    _id: order._id,
                    orderId: order._id.toString().slice(-8),
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    itemsCount: order.orderItems?.length || 0,
                    isPaid: order.isPaid,
                    paymentMethod: order.paymentMethod
                }));
                
                // Calculate monthly order history (last 6 months)
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                
                const monthlyOrders = await Order.aggregate([
                    { 
                        $match: { 
                            user: user._id,
                            createdAt: { $gte: sixMonthsAgo }
                        } 
                    },
                    {
                        $group: {
                            _id: { 
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            count: { $sum: 1 },
                            total: { $sum: "$totalPrice" }
                        }
                    },
                    { $sort: { "_id.year": -1, "_id.month": -1 } }
                ]);
                
                // Format cart items with better structure
                const formattedCartItems = cartItems.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    name: item.menuItem?.name || 'Unknown Item',
                    price: item.menuItem?.price || 0,
                    totalPrice: (item.menuItem?.price || 0) * item.quantity,
                    image: item.menuItem?.image || null
                }));
                
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    zipCode: user.zipCode,
                    createdAt: user.createdAt,
                    cart: {
                        items: formattedCartItems,
                        totalItems: totalCartItems,
                        totalPrice: totalCartPrice
                    },
                    orders: {
                        count: orderCount,
                        totalSpent: totalSpent,
                        recent: recentOrders,
                        all: userOrders.map(order => ({
                            _id: order._id,
                            orderId: order._id.toString().slice(-8),
                            totalPrice: order.totalPrice,
                            status: order.status,
                            createdAt: order.createdAt,
                            itemsCount: order.orderItems?.length || 0,
                            isPaid: order.isPaid,
                            paymentMethod: order.paymentMethod
                        })),
                        statusBreakdown: orderStatusBreakdown,
                        monthlyHistory: monthlyOrders
                    },
                    averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0
                };
            })
        );
        
        res.json(usersWithCompleteData);
    } catch (error) {
        console.error('Error fetching users with cart data:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get dashboard statistics with enhanced data
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const totalRevenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        
        // Count users with items in cart
        const activeCarts = await User.countDocuments({ 
            'cart.0': { $exists: true }
        });
        
        // Get order status breakdown
        const orderStatusBreakdown = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        // Get recent orders with full details
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email');
        
        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: today }
        });
        
        const todayRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        
        // Get this week's stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weekOrders = await Order.countDocuments({
            createdAt: { $gte: weekAgo }
        });
        
        const weekRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        
        // Get top customers by order count and total spent
        const topCustomers = await Order.aggregate([
            { 
                $group: { 
                    _id: "$user", 
                    orderCount: { $sum: 1 }, 
                    totalSpent: { $sum: "$totalPrice" } 
                } 
            },
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
            { 
                $lookup: { 
                    from: "users", 
                    localField: "_id", 
                    foreignField: "_id", 
                    as: "userDetails" 
                } 
            },
            { $unwind: "$userDetails" },
            { 
                $project: {
                    "userDetails.password": 0,
                    "userDetails.cart": 0
                }
            }
        ]);
        
        // Get revenue by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyRevenue = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        
        res.json({
            totalUsers,
            totalOrders,
            totalRevenue,
            activeCarts,
            recentOrders,
            orderStatusBreakdown,
            topCustomers,
            monthlyRevenue,
            todayStats: {
                orders: todayOrders,
                revenue: todayRevenue[0]?.total || 0
            },
            weekStats: {
                orders: weekOrders,
                revenue: weekRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single user with detailed cart data and complete order history
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('cart.menuItem');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Calculate cart totals with enhanced details
        const cartItems = user.cart || [];
        let totalCartPrice = 0;
        const enhancedCartItems = cartItems.map(item => {
            const itemTotal = (item.menuItem?.price || 0) * item.quantity;
            totalCartPrice += itemTotal;
            return {
                ...item.toObject(),
                menuItem: item.menuItem,
                name: item.menuItem?.name || 'Unknown Item',
                price: item.menuItem?.price || 0,
                image: item.menuItem?.image || null,
                category: item.menuItem?.category || null,
                itemTotal
            };
        });

        // Get user's complete order history with full details
        const orders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        
        // Calculate user statistics
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        
        // Get orders by status with counts
        const ordersByStatus = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        
        // Get payment status breakdown
        const paidOrders = orders.filter(o => o.isPaid).length;
        const unpaidOrders = orders.filter(o => !o.isPaid).length;
        
        // Get monthly order history
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyOrders = await Order.aggregate([
            { 
                $match: { 
                    user: user._id,
                    createdAt: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);
        
        // Format orders for response
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderId: order._id.toString().slice(-8),
            totalPrice: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt,
            itemsCount: order.orderItems?.length || 0,
            items: order.orderItems.map(item => ({
                name: item.name,
                quantity: item.qty,
                price: item.price,
                image: item.image,
                total: item.price * item.qty
            })),
            isPaid: order.isPaid,
            paidAt: order.paidAt,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            itemsPrice: order.itemsPrice,
            taxPrice: order.taxPrice,
            shippingPrice: order.shippingPrice
        }));
        
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone,
                address: user.address,
                city: user.city,
                zipCode: user.zipCode,
                createdAt: user.createdAt
            },
            cart: {
                items: enhancedCartItems,
                totalPrice: totalCartPrice,
                itemCount: cartItems.length
            },
            orders: formattedOrders,
            stats: {
                totalOrders,
                totalSpent,
                averageOrderValue,
                ordersByStatus,
                paidOrders,
                unpaidOrders,
                monthlyOrders
            }
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all orders with filtering options and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 20, userId } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (userId) {
            query.user = userId;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Order.countDocuments(query);
        
        // Get summary statistics for filtered orders
        const summary = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    averageOrderValue: { $avg: "$totalPrice" },
                    minOrder: { $min: "$totalPrice" },
                    maxOrder: { $max: "$totalPrice" }
                }
            }
        ]);
        
        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            },
            summary: summary[0] || {
                totalRevenue: 0,
                averageOrderValue: 0,
                minOrder: 0,
                maxOrder: 0
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single order with full details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
router.get('/orders/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone address city zipCode');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        const oldStatus = order.status;
        order.status = status;
        
        // Update delivery status if order is delivered
        if (status === 'Delivered' && !order.isDelivered) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        // If order was cancelled, update payment status if needed
        if (status === 'Cancelled' && order.isPaid) {
            // You might want to handle refund logic here
            console.log(`Order ${order._id} cancelled - refund may be needed`);
        }
        
        const updatedOrder = await order.save();
        
        // Log the status change for audit
        console.log(`Order ${order._id} status changed from ${oldStatus} to ${status} by admin ${req.user._id}`);
        
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Assign driver to order
// @route   PUT /api/admin/orders/:id/assign-driver
// @access  Private/Admin
router.put('/orders/:id/assign-driver', protect, admin, async (req, res) => {
    try {
        const { driverId } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.driver = driverId || null;
        order.assignedAt = driverId ? Date.now() : null;
        
        // Only change status if we are actually assigning a driver
        if (driverId && order.status === 'Preparing') {
            order.status = 'Out for Delivery';
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user order history by user ID
// @route   GET /api/admin/users/:userId/orders
// @access  Private/Admin
router.get('/users/:userId/orders', protect, admin, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Order.countDocuments({ user: req.params.userId });
        
        const summary = await Order.aggregate([
            { $match: { user: req.params.userId } },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$totalPrice" },
                    averageOrderValue: { $avg: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            },
            summary: summary[0] || {
                totalSpent: 0,
                averageOrderValue: 0,
                totalOrders: 0
            }
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete user and all their associated data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.isAdmin) {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }

            // Delete all orders for this user
            await Order.deleteMany({ user: user._id });
            
            // Delete associated cart if exists
            await Cart.deleteMany({ user: user._id });
            
            // Delete the user (this also deletes their embedded cart)
            await User.findByIdAndDelete(req.params.id);

            res.json({ message: 'User and all associated data deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;