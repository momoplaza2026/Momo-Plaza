const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurants
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            res.json(restaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a restaurant (Admin)
// @route   POST /api/restaurants
const createRestaurant = async (req, res) => {
    try {
        const { name, description, address, image, cuisine } = req.body;
        const restaurant = new Restaurant({
            name,
            description,
            address,
            image,
            cuisine,
        });
        const createdRestaurant = await restaurant.save();
        res.status(201).json(createdRestaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a restaurant (Admin)
// @route   PUT /api/restaurants/:id
const updateRestaurant = async (req, res) => {
    try {
        const { name, description, address, image, cuisine } = req.body;
        const restaurant = await Restaurant.findById(req.params.id);

        if (restaurant) {
            restaurant.name = name || restaurant.name;
            restaurant.description = description || restaurant.description;
            restaurant.address = address || restaurant.address;
            restaurant.image = image || restaurant.image;
            restaurant.cuisine = cuisine || restaurant.cuisine;

            const updatedRestaurant = await restaurant.save();
            res.json(updatedRestaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a restaurant (Admin)
// @route   DELETE /api/restaurants/:id
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            await restaurant.deleteOne();
            res.json({ message: 'Restaurant removed' });
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant };
