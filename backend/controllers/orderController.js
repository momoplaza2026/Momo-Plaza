const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        } else {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                isPaid: req.body.isPaid || false,
                paidAt: req.body.paidAt,
                paymentResult: req.body.paymentResult,
            });

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('driver', 'name email phone');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'id name email phone')
            .populate('driver', 'id name email phone');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            
            if (req.body.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign driver to order
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin
const assignDriverToOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.driver = req.body.driverId;
            order.assignedAt = Date.now();
            order.status = 'Out for Delivery';
            
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver orders
// @route   GET /api/orders/driver/myorders
// @access  Private/Driver
const getDriverOrders = async (req, res) => {
    try {
        const { page = 1, limit = 5, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { driver: req.user._id };
        
        if (req.query.status === 'active') {
            query.status = { $in: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'] };
        } else if (req.query.status === 'past') {
            query.status = 'Delivered';
        } else if (req.query.status) {
            query.status = req.query.status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone address city zipCode lat lng')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Order.countDocuments(query);

        // Get stats (always for all driver's orders)
        const activeCount = await Order.countDocuments({ 
            driver: req.user._id, 
            status: { $in: ['Placed', 'Preparing', 'Out for Delivery'] } 
        });
        const deliveredCount = await Order.countDocuments({ 
            driver: req.user._id, 
            status: 'Delivered' 
        });

        res.json({
            orders,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            stats: {
                active: activeCount,
                delivered: deliveredCount,
                earnings: deliveredCount * 40 // Example calculation
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await Order.deleteOne({ _id: order._id });
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    assignDriverToOrder,
    getDriverOrders,
    deleteOrder
};
