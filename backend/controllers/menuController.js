const Menu = require('../models/Menu');
const Notification = require('../models/Notification');
const { sendNotificationToTopic } = require('../config/firebase');

// @desc    Fetch all menu items
// @route   GET /api/menu
const getMenuItems = async (req, res) => {
    try {
        // Only return available items to customers
        // $ne: false ensures we include legacy items where isAvailable is missing (undefined)
        const items = await Menu.find({ isAvailable: { $ne: false } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch ALL menu items including unavailable (for Admin)
// @route   GET /api/menu/admin/all
const getAdminMenuItems = async (req, res) => {
    try {
        const items = await Menu.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
    try {
        const { name, category, price, img, isVeg } = req.body;
        console.log('Creating menu item:', name);
        const menuItem = new Menu({
            name, 
            category, 
            price: Number(price), 
            img, 
            isVeg: isVeg !== undefined ? isVeg : true
        });
        const createdItem = await menuItem.save();

        // Save in-app notification
        await Notification.create({
            title: `New Dish: ${name} 🍕`,
            message: `${name} is now available for ₹${price}. Try it now!`,
            type: 'NEW_FOOD',
            image: img,
            metadata: { itemId: createdItem._id.toString(), itemName: name, price: Number(price) }
        });

        // Send push notification to all customers subscribed to 'new_food' topic
        console.log('Triggering NEW_FOOD notification...');
        await sendNotificationToTopic(
            'new_food',
            `New Dish: ${name} 🍕`,
            `${name} is now available for ₹${price}. Try it now!`,
            { itemId: createdItem._id.toString(), type: 'NEW_FOOD' },
            img
        );

        res.status(201).json(createdItem);
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
    try {
        const { name, category, price, img, isVeg, rating, orders } = req.body;
        const id = req.params.id;
        
        console.log(`Updating menu item: ${id}`);
        const menuItem = await Menu.findById(id);

        if (menuItem) {
            menuItem.name = name || menuItem.name;
            menuItem.category = category || menuItem.category;
            menuItem.price = price !== undefined ? Number(price) : menuItem.price;
            menuItem.img = img || menuItem.img;
            menuItem.isVeg = isVeg !== undefined ? isVeg : menuItem.isVeg;
            menuItem.rating = rating !== undefined ? Number(rating) : menuItem.rating;
            menuItem.orders = orders !== undefined ? Number(orders) : menuItem.orders;

            const updatedItem = await menuItem.save();

            // Save in-app notification
            await Notification.create({
                title: 'Menu Update: ' + updatedItem.name + ' ✨',
                message: `${updatedItem.name} has been updated. Check out the new details!`,
                type: 'UPDATE_FOOD',
                image: updatedItem.img,
                metadata: { itemId: updatedItem._id.toString(), itemName: updatedItem.name, price: updatedItem.price }
            });

            // Send push notification to all customers subscribed to 'new_food' topic
            console.log('Triggering UPDATE_FOOD notification...');
            await sendNotificationToTopic(
                'new_food',
                'Menu Update: ' + updatedItem.name + ' ✨',
                `${updatedItem.name} has been updated. Check out the new details!`,
                { itemId: updatedItem._id.toString(), type: 'UPDATE_FOOD' },
                updatedItem.img
            );

            res.json(updatedItem);
        } else {
            console.log(`Menu item not found: ${id}`);
            res.status(404).json({ message: `Menu item with ID ${id} not found` });
        }
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Setting menu item to unavailable: ${id}`);
        const menuItem = await Menu.findById(id);
        if (menuItem) {
            const deletedItemName = menuItem.name;
            
            // Soft delete: set isAvailable to false instead of deleting from DB
            menuItem.isAvailable = false;
            await menuItem.save();
            
            console.log(`Successfully marked menu item as unavailable: ${id}`);
            
            // Save in-app notification
            await Notification.create({
                title: 'Menu Update: Item Unavailable 🚫',
                message: `${deletedItemName} is temporarily unavailable.`,
                type: 'DELETE_FOOD',
                image: menuItem.img,
                metadata: { itemId: id, itemName: deletedItemName }
            });

            // Send push notification to all customers
            console.log('Triggering DELETE_FOOD notification...');
            await sendNotificationToTopic(
                'new_food',
                'Menu Update: Item Unavailable 🚫',
                `${deletedItemName} is temporarily unavailable.`,
                { itemId: id, type: 'DELETE_FOOD' }
            );

            res.json({ message: 'Menu item marked as unavailable' });
        } else {
            console.log(`Action failed: Menu item not found - ${id}`);
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        console.error('Delete/Unavailable error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/toggle
// @access  Private/Admin
const toggleMenuItemAvailability = async (req, res) => {
    try {
        const menuItem = await Menu.findById(req.params.id);
        if (menuItem) {
            menuItem.isAvailable = !menuItem.isAvailable;
            await menuItem.save();
            res.json(menuItem);
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMenuItems, getAdminMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability };
