const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay order
// @route   POST /api/payments/order
const createRazorpayOrder = async (req, res) => {
    try {
        // Strip any random quotes that dotenv might have left
        const key_id = process.env.RAZORPAY_KEY_ID?.replace(/['"]/g, '');
        const key_secret = process.env.RAZORPAY_KEY_SECRET?.replace(/['"]/g, '');

        if (!key_id || key_id === 'rzp_test_placeholder' || !key_secret || key_secret === 'secret_placeholder') {
            return res.status(500).json({ 
                message: 'Razorpay keys are not configured correctly in the server environment.' 
            });
        }

        const instance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret,
        });

        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid amount provided' });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).json({ message: 'Failed to create Razorpay order' });

        res.json(order);
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ 
            message: 'Error connecting to Razorpay: ' + (error.message || 'Internal Server Error') 
        });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const key_secret = process.env.RAZORPAY_KEY_SECRET?.replace(/['"]/g, '') || 'secret_placeholder';

        const shasum = crypto.createHmac('sha256', key_secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({ msg: 'Transaction not legit!' });
        }

        res.json({
            msg: 'success',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createRazorpayOrder, verifyPayment };
