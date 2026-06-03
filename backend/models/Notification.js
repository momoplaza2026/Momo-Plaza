const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['NEW_FOOD', 'UPDATE_FOOD', 'DELETE_FOOD', 'OFFER', 'ORDER', 'GENERAL'],
        default: 'GENERAL'
    },
    image: { type: String },
    // Global notifications are for all users
    isGlobal: { type: Boolean, default: true },
    // Track which users have read this notification
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    metadata: {
        itemId: { type: String },
        itemName: { type: String },
        price: { type: Number }
    }
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ readBy: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
