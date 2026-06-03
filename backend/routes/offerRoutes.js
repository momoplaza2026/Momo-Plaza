const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Offer = require('../models/Offer');

// ============================================================
// PUBLIC ROUTES (for customers)
// ============================================================

// @desc    Get all active offers (public)
// @route   GET /api/offers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        }).sort({ createdAt: -1 });

        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Validate and apply a coupon code to a cart total
// @route   POST /api/offers/apply
// @access  Private (logged-in user)
router.post('/apply', protect, async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code || cartTotal === undefined) {
            return res.status(400).json({ message: 'Coupon code and cart total are required' });
        }

        const offer = await Offer.findOne({ code: code.toUpperCase() });

        if (!offer) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!offer.isActive) {
            return res.status(400).json({ message: 'This offer is no longer active' });
        }

        const now = new Date();
        if (now < offer.validFrom || now > offer.validUntil) {
            return res.status(400).json({ message: 'This offer has expired or is not yet active' });
        }

        if (offer.usageLimit !== null && offer.usedCount >= offer.usageLimit) {
            return res.status(400).json({ message: 'This offer has reached its usage limit' });
        }

        if (cartTotal < offer.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order amount of ₹${offer.minOrderAmount} required. Your cart total is ₹${cartTotal}` 
            });
        }

        // Calculate discount
        let discount = 0;
        if (offer.discountType === 'percentage') {
            discount = (cartTotal * offer.discountValue) / 100;
            // Apply max discount cap if set
            if (offer.maxDiscount !== null && discount > offer.maxDiscount) {
                discount = offer.maxDiscount;
            }
        } else {
            // flat discount
            discount = offer.discountValue;
        }

        // Make sure discount doesn't exceed cart total
        if (discount > cartTotal) {
            discount = cartTotal;
        }

        discount = Number(discount.toFixed(2));

        res.json({
            success: true,
            offer: {
                _id: offer._id,
                title: offer.title,
                code: offer.code,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
                maxDiscount: offer.maxDiscount
            },
            discount,
            newTotal: Number((cartTotal - discount).toFixed(2)),
            message: `Coupon applied! You save ₹${discount}`
        });
    } catch (error) {
        console.error('Error applying offer:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================================
// ADMIN ROUTES (for managing offers)
// ============================================================

// @desc    Get ALL offers (including inactive/expired) for admin
// @route   GET /api/offers/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const offers = await Offer.find({}).sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        console.error('Error fetching all offers:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new offer
// @route   POST /api/offers/admin
// @access  Private/Admin
router.post('/admin', protect, admin, async (req, res) => {
    try {
        const {
            title, description, code, discountType, discountValue,
            minOrderAmount, maxDiscount, color, isActive, validFrom, validUntil, usageLimit
        } = req.body;

        // Check if code already exists
        const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
        if (existingOffer) {
            return res.status(400).json({ message: 'An offer with this code already exists' });
        }

        const offer = new Offer({
            title,
            description,
            code: code.toUpperCase(),
            discountType: discountType || 'percentage',
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || null,
            color: color || '#ef4444',
            isActive: isActive !== undefined ? isActive : true,
            validFrom: validFrom || Date.now(),
            validUntil,
            usageLimit: usageLimit || null
        });

        const savedOffer = await offer.save();
        res.status(201).json(savedOffer);
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update an existing offer
// @route   PUT /api/offers/admin/:id
// @access  Private/Admin
router.put('/admin/:id', protect, admin, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        const {
            title, description, code, discountType, discountValue,
            minOrderAmount, maxDiscount, color, isActive, validFrom, validUntil, usageLimit
        } = req.body;

        // If code is being changed, check uniqueness
        if (code && code.toUpperCase() !== offer.code) {
            const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
            if (existingOffer) {
                return res.status(400).json({ message: 'An offer with this code already exists' });
            }
        }

        offer.title = title || offer.title;
        offer.description = description || offer.description;
        offer.code = code ? code.toUpperCase() : offer.code;
        offer.discountType = discountType || offer.discountType;
        offer.discountValue = discountValue !== undefined ? discountValue : offer.discountValue;
        offer.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : offer.minOrderAmount;
        offer.maxDiscount = maxDiscount !== undefined ? maxDiscount : offer.maxDiscount;
        offer.color = color || offer.color;
        offer.isActive = isActive !== undefined ? isActive : offer.isActive;
        offer.validFrom = validFrom || offer.validFrom;
        offer.validUntil = validUntil || offer.validUntil;
        offer.usageLimit = usageLimit !== undefined ? usageLimit : offer.usageLimit;

        const updatedOffer = await offer.save();
        res.json(updatedOffer);
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete an offer
// @route   DELETE /api/offers/admin/:id
// @access  Private/Admin
router.delete('/admin/:id', protect, admin, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        await Offer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle offer active status
// @route   PATCH /api/offers/admin/:id/toggle
// @access  Private/Admin
router.patch('/admin/:id/toggle', protect, admin, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        offer.isActive = !offer.isActive;
        const updatedOffer = await offer.save();
        res.json(updatedOffer);
    } catch (error) {
        console.error('Error toggling offer:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
