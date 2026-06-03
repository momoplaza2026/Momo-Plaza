const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    maxDiscount: {
        type: Number,
        default: null // null means no cap
    },
    color: {
        type: String,
        default: '#ef4444'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Virtual to check if offer is currently valid
offerSchema.virtual('isValid').get(function() {
    const now = new Date();
    return this.isActive && 
           now >= this.validFrom && 
           now <= this.validUntil &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Ensure virtuals are included in JSON
offerSchema.set('toJSON', { virtuals: true });
offerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Offer', offerSchema);
