const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String, required: true },
    isVeg: { type: Boolean, required: true, default: true },
    rating: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
