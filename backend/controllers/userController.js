const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { admin, subscribeTokenToTopic, sendNotificationToTopic } = require('../config/firebase');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(`Login attempt for email: ${email}`);
        
        const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('cart.menuItem');

        if (user) {
            console.log('User found, verifying password...');
            const isMatch = await user.matchPassword(password);
            console.log(`Password match: ${isMatch}`);
            if (isMatch) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isDriver: user.isDriver,
                    isAvailable: user.isAvailable,
                    cart: user.cart,
                    dailyAddItemCount: user.dailyAddItemCount,
                    lastAddItemDate: user.lastAddItemDate,
                    token: generateToken(user._id),
                });
            } else {
                console.log('Password verification failed');
                res.status(401).json({ message: 'Incorrect password' });
            }
        } else {
            console.log('User not found in database');
            res.status(401).json({ message: 'Email not found' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`Registration attempt for Name: ${name}, Email: ${email}`);
        
        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail }).populate('cart.menuItem');

        if (userExists) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email: normalizedEmail, password });
        if (user) {
            console.log('User created successfully:', user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isDriver: user.isDriver,
                isAvailable: user.isAvailable,
                cart: user.cart,
                dailyAddItemCount: user.dailyAddItemCount,
                lastAddItemDate: user.lastAddItemDate,
                token: generateToken(user._id),
            });
        } else {
            console.log('Invalid user data received');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
    try {
        // Populate the cart for the profile fetch as well
        const user = await User.findById(req.user._id).populate('cart.menuItem');
        
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isDriver: user.isDriver,
                isAvailable: user.isAvailable,
                phone: user.phone,
                address: user.address,
                city: user.city,
                zipCode: user.zipCode,
                cart: user.cart,
                dailyAddItemCount: user.dailyAddItemCount,
                lastAddItemDate: user.lastAddItemDate
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        console.log('UpdateProfile called for user ID:', req.user._id);
        console.log('Update data:', req.body);
        
        const user = await User.findById(req.user._id);

        if (user) {
            console.log('User found in DB, applying changes...');
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.city = req.body.city || user.city;
            user.zipCode = req.body.zipCode || user.zipCode;
            user.lat = req.body.lat !== undefined ? req.body.lat : user.lat;
            user.lng = req.body.lng !== undefined ? req.body.lng : user.lng;

            if (req.body.password) {
                console.log('Password change detected, updating...');
                user.password = req.body.password;
            }

            console.log('Saving user...');
            const updatedUser = await user.save();
            console.log('User saved successfully');

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                isDriver: updatedUser.isDriver,
                isAvailable: updatedUser.isAvailable,
                phone: updatedUser.phone,
                address: updatedUser.address,
                city: updatedUser.city,
                zipCode: updatedUser.zipCode,
                lat: updatedUser.lat,
                lng: updatedUser.lng,
                cart: updatedUser.cart,
                dailyAddItemCount: updatedUser.dailyAddItemCount,
                lastAddItemDate: updatedUser.lastAddItemDate,
                token: generateToken(updatedUser._id),
            });
        } else {
            console.log('User not found in DB during update');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile (Detailed):', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Subscribe to notifications
// @route   POST /api/users/subscribe
const subscribeToNotifications = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        console.log(`Subscribing token to new_food topic: ${token.substring(0, 10)}...`);
        const result = await subscribeTokenToTopic(token, 'new_food');
        res.status(200).json({ message: 'Subscribed successfully', result });
    } catch (error) {
        console.error('Error in subscribeToNotifications controller:', error);
        res.status(500).json({ 
            message: 'Failed to subscribe to notifications', 
            error: error.message,
            code: error.code
        });
    }
};

// @desc    Send test notification
// @route   POST /api/users/test-notification
const testNotification = async (req, res) => {
    try {
        const { token: directToken } = req.body;
        console.log('=== STARTING TEST NOTIFICATION ===');
        
        if (!admin || !admin.apps.length) {
            console.error('❌ Cannot test notifications: Firebase Admin SDK is not initialized.');
            return res.status(503).json({ 
                message: 'Notification Server Not Ready', 
                details: 'The Firebase Admin SDK is not initialized. This usually means the service account JSON file is missing or contains placeholders.',
                troubleshooting: 'Check your backend folder for a .json file from Firebase and ensure it contains a real "private_key".'
            });
        }

        console.log('Received token:', directToken ? directToken.substring(0, 20) + '...' : 'NONE');

        // 1. Send to Topic
        console.log('📤 Sending to TOPIC: new_food');
        await sendNotificationToTopic(
            'new_food',
            'Test: Topic Push 🍕',
            'If you see this, you are successfully subscribed to the new_food topic!',
            { type: 'TEST_TOPIC' },
            'https://cdn-icons-png.flaticon.com/512/1046/1046747.png'
        );
        console.log('✅ Topic message sent');

        // 2. Send Direct (if token provided)
        if (directToken) {
            // console.log('📤 Sending DIRECT message to token:', directToken.substring(0, 20) + '...');
            const message = {
                notification: {
                    title: 'MealMatrix: Direct Push 🚀',
                    body: 'If you see this, your browser can receive direct messages from our server!',
                },
                token: directToken,
                data: {
                    title: 'MealMatrix: Direct Push 🚀',
                    body: 'If you see this, your browser can receive direct messages from our server!',
                    type: 'TEST_DIRECT',
                    click_action: 'https://momo-plaza.vercel.app/',
                },
                webpush: {
                    fcmOptions: {
                        link: 'https://momo-plaza.vercel.app/'
                    }
                }
            };
            try {
                const response = await admin.messaging().send(message);
                console.log('✅ Direct message sent:', response);
            } catch (directErr) {
                console.error('❌ Direct message failed:', directErr.message);
                throw directErr;
            }
        } else {
            console.log('⚠️ No token provided, skipping direct message');
        }

        console.log('=== TEST NOTIFICATION COMPLETE ===');
        res.status(200).json({ message: 'Test notifications triggered' });
    } catch (error) {
        console.error('❌ SERVER ERROR in testNotification:', error.message);
        res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};

// @desc    Register a new driver
// @route   POST /api/users/drivers
// @access  Private/Admin
const registerDriver = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            phone,
            isDriver: true,
            isAvailable: false // Initially offline
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isDriver: user.isDriver,
                phone: user.phone
            });
        } else {
            res.status(400).json({ message: 'Invalid driver data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all drivers
// @route   GET /api/users/drivers
// @access  Private/Admin
const getDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ isDriver: true }).select('-password');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update driver availability
// @route   PUT /api/users/availability
// @access  Private/Driver
const updateDriverAvailability = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : user.isAvailable;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                isAvailable: updatedUser.isAvailable
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
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
};
