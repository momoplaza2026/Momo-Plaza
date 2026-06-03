const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String }, // e.g., Starter, Main Course, Dessert
    isVeg: { type: Boolean, default: true }
});

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    cuisine: [{ type: String }], // e.g., Indian, Chinese, Italian
    menu: [menuItemSchema]
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
