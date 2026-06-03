import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, ChevronRight, Lock, Truck, Zap, ShieldCheck, User, Phone, Mail, Home, MapPinned, Navigation as NavIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';

const Checkout = () => {
    const { cartItems, totalPrice, itemsPrice, taxPrice, shippingPrice, clearCart, discount, appliedOffer } = useCart();
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showMap, setShowMap] = useState(false);
    const [address, setAddress] = useState({
        fullName: userInfo?.name || '',
        phone: userInfo?.phone || '',
        email: userInfo?.email || '',
        houseNo: '',
        street: '',
        landmark: '',
        city: userInfo?.city || '',
        postalCode: userInfo?.zipCode || '',
        country: 'India'
    });

    const [loading, setLoading] = useState(true);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isPlacing, setIsPlacing] = useState(false);
    const [step, setStep] = useState(1);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (userInfo && userInfo.isDriver) {
            navigate('/driver/dashboard');
            return;
        }

        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 992);
        };
        window.addEventListener('resize', handleResize);

        const fetchLatestProfile = async () => {
            if (!userInfo || !userInfo.token) {
                setLoading(false);
                return;
            }
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await axios.get('/api/users/profile', config);
                
                // Try to parse the address if it was saved by Checkout before
                // Format: "houseNo, street, landmark"
                let houseNo = '';
                let street = '';
                let landmark = '';
                
                if (data.address) {
                    const parts = data.address.split(',').map(p => p.trim());
                    if (parts.length >= 1) houseNo = parts[0];
                    if (parts.length >= 2) street = parts[1];
                    if (parts.length >= 3) landmark = parts[2];
                    // If there are more parts, combine them into street or landmark
                    if (parts.length > 3) {
                        landmark = parts.slice(2).join(', ');
                    }
                }

                const profile = {
                    fullName: data.name || userInfo.name || '',
                    phone: data.phone || userInfo.phone || '',
                    email: data.email || userInfo.email || '',
                    houseNo: houseNo,
                    street: street,
                    landmark: landmark,
                    city: data.city || '',
                    postalCode: data.zipCode || '',
                    country: 'India'
                };

                setProfileData(profile);
                setAddress(profile);
            } catch (error) {
                console.error('Failed to fetch profile in checkout:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestProfile();

        return () => window.removeEventListener('resize', handleResize);
    }, [userInfo, navigate]);

    // AUTO-PAY Logic for AI Genie
    useEffect(() => {
        if (!loading && location.state?.autoPay && cartItems.length > 0) {
            // Check for unavailable items before autopay
            const hasUnavailable = cartItems.some(item => item.isUnavailable);
            if (hasUnavailable) {
                toast.error('Some items are unavailable. Please check your cart.');
                navigate('/cart');
                return;
            }

            // Give it a tiny bit of time to settle
            const timer = setTimeout(() => {
                setPaymentMethod('Online');
                handlePlaceOrder();
                // Clear state so it doesn't re-trigger on refresh
                window.history.replaceState({}, document.title);
            }, 1500);
            return () => clearTimeout(timer);
        }

        // General check for unavailable items
        if (!loading && cartItems.length > 0) {
            const hasUnavailable = cartItems.some(item => item.isUnavailable);
            if (hasUnavailable) {
                toast.error('Some items in your cart are temporarily unavailable.');
                navigate('/cart');
            }
        }
    }, [loading, location.state, cartItems.length, cartItems]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

    const handleAutofill = () => {
        if (profileData) {
            setAddress(profileData);
            toast.success('Details imported from profile');
        } else {
            toast.error('No profile details found');
        }
    };

    const handleLocationSelect = (data) => {
        const addressParts = data.address.split(',');
        setAddress(prev => ({
            ...prev,
            houseNo: addressParts[0] || prev.houseNo || 'Pinpointed',
            street: addressParts.slice(1).join(', ') || data.address || prev.street,
            landmark: prev.landmark || 'Near Pinpoint',
            city: data.city || prev.city,
            postalCode: data.pincode || prev.postalCode,
            lat: data.lat,
            lng: data.lng
        }));
        setShowMap(false);
        toast.success('Pinpoint location set!');
    };

    const validateAllFields = () => {
        const requiredFields = [
            { field: 'fullName', message: 'Full name is required' },
            { field: 'phone', message: 'Phone number is required' },
            { field: 'email', message: 'Email is required' },
            { field: 'houseNo', message: 'House/Flat No. is required' },
            { field: 'street', message: 'Street address is required' },
            { field: 'landmark', message: 'Landmark is required' },
            { field: 'city', message: 'City is required' },
            { field: 'postalCode', message: 'Postal code is required' }
        ];

        for (const { field, message } of requiredFields) {
            if (!address[field]?.trim()) {
                toast.error(message);
                return false;
            }
        }

        if (!validateEmail(address.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        if (!validatePhone(address.phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!userInfo || !userInfo.token) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        if (!validateAllFields()) {
            if (!isDesktop) setStep(1); 
            return;
        }

        setIsPlacing(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            // 1. Update user profile with latest details
            const profileData = {
                name: address.fullName,
                phone: address.phone,
                email: address.email,
                address: `${address.houseNo}, ${address.street}, ${address.landmark}`,
                city: address.city,
                zipCode: address.postalCode,
                lat: address.lat,
                lng: address.lng
            };
            
            await axios.put('/api/users/profile', profileData, config);

            // 2. Map cart items
            const orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.img || item.image || (item.menuItem?.img) || 'https://via.placeholder.com/150',
                price: item.price,
                menuItem: item.id || item._id
            }));

            if (paymentMethod === 'Online') {
                // Razorpay Online Payment Flow
                const { data: orderData } = await axios.post('/api/payments/order', {
                    amount: totalPrice,
                }, config);

                const options = {
                    key: 'rzp_test_SPu7r8RLqxRpd2',
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Momo Plaza",
                    description: "Food Order Payment",
                    order_id: orderData.id,
                    handler: async (response) => {
                        try {
                            const { data: verifyData } = await axios.post('/api/payments/verify', response, config);
                            
                            if (verifyData.msg === 'success') {
                                // Place the order in DB after successful payment
                                const { data: createdOrder } = await axios.post('/api/orders', {
                                    orderItems,
                                    shippingAddress: {
                                        address: `${address.houseNo}, ${address.street}, ${address.landmark}`,
                                        city: address.city,
                                        postalCode: address.postalCode,
                                        country: address.country,
                                        lat: address.lat,
                                        lng: address.lng
                                    },
                                    paymentMethod,
                                    itemsPrice,
                                    taxPrice,
                                    shippingPrice,
                                    totalPrice,
                                    isPaid: true,
                                    paidAt: new Date(),
                                    paymentResult: {
                                        id: response.razorpay_payment_id,
                                        status: 'success',
                                        update_time: new Date().toISOString()
                                    }
                                }, config);

                                toast.success('Payment successful & Order placed!');
                                clearCart();
                                navigate(`/order/${createdOrder._id}`);
                            }
                        } catch (err) {
                            toast.error('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: address.fullName,
                        email: address.email,
                        contact: address.phone,
                    },
                    theme: {
                        color: "#ef4444",
                    },
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + response.error.description);
                });
                rzp1.open();
                setIsPlacing(false);
            } else {
                // Cash on Delivery Flow
                const { data: createdOrder } = await axios.post('/api/orders', {
                    orderItems,
                    shippingAddress: {
                        address: `${address.houseNo}, ${address.street}, ${address.landmark}`,
                        city: address.city,
                        postalCode: address.postalCode,
                        country: address.country,
                        lat: address.lat,
                        lng: address.lng
                    },
                    paymentMethod,
                    itemsPrice,
                    taxPrice,
                    shippingPrice,
                    totalPrice,
                }, config);

                toast.success('Order placed successfully!');
                clearCart();
                navigate(`/order/${createdOrder._id}`);
            }
        } catch (error) {
            console.error('Checkout error details:', error.response?.data || error);
            const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
            toast.error(message, { duration: 5000 });
            if (message.includes('Razorpay')) {
                toast.error('Payment gateway configuration error. Please contact support.', { duration: 5000 });
            }
        } finally {
            if (paymentMethod !== 'Online') setIsPlacing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '20px' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ 
                        width: '60px', 
                        height: '60px', 
                        border: '3px solid rgba(239, 68, 68, 0.1)', 
                        borderTopColor: '#ef4444', 
                        borderRadius: '50%' 
                    }}
                />
                <p style={{ color: '#888', letterSpacing: '2px', fontSize: '12px', fontWeight: 'bold' }}>PREPARING SECURE CHECKOUT...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-empty-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '0 16px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass checkout-empty-card"
                    style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center' }}
                >
                    <h1 style={{ marginBottom: '10px', fontSize: 'clamp(20px, 5vw, 28px)' }}>Your Cart is Empty</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px' }}>
                        Add items to your cart before proceeding to checkout.
                    </p>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Browse Menu
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* Responsive styles for Checkout component */
                .checkout-page {
                    padding: 40px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 30px;
                }

                .checkout-left,
                .checkout-right {
                    min-width: 0;
                }

                .checkout-right .glass {
                    position: sticky;
                    top: 100px;
                }

                .glass-card {
                    padding: 30px;
                }

                .input-icon-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 15px;
                    top: 14px;
                    color: var(--text-muted);
                }

                .input-field {
                    width: 100%;
                    padding: 12px 15px 12px 45px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 10px;
                    color: white;
                    font-size: 16px;
                }

                .input-field.no-icon {
                    padding: 12px 15px;
                }

                .btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #ef4444, #b91c1c);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 12px 24px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: 100%;
                    justify-content: center;
                }

                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* Desktop combined view */
                .combined-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* Tablet and below */
                @media (max-width: 991px) {
                    .checkout-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }

                    .checkout-right .glass {
                        position: static;
                    }

                    .glass-card {
                        padding: 20px;
                    }

                    .checkout-page {
                        padding: 20px 16px;
                    }
                }

                /* Small mobile (down to 280px) */
                @media (max-width: 480px) {
                    .checkout-page {
                        padding: 16px 12px;
                    }

                    h1 {
                        font-size: 24px !important;
                    }

                    h2 {
                        font-size: 18px !important;
                    }

                    h3 {
                        font-size: 15px !important;
                    }

                    .glass-card {
                        padding: 16px;
                    }

                    .input-field {
                        padding: 10px 12px 10px 40px;
                        font-size: 14px;
                    }

                    .input-field.no-icon {
                        padding: 10px 12px;
                    }

                    .input-icon {
                        left: 12px;
                        top: 12px;
                        width: 16px;
                        height: 16px;
                    }

                    .btn-primary {
                        padding: 10px 16px;
                        font-size: 14px;
                    }

                    .two-col-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }

                    .step-indicator {
                        width: 30px !important;
                    }

                    .order-item {
                        gap: 10px;
                    }

                    .order-item img {
                        width: 40px;
                        height: 40px;
                    }
                }

                /* Extra small (down to 280px) */
                @media (max-width: 360px) {
                    .glass-card {
                        padding: 12px;
                    }

                    .input-field {
                        padding: 8px 10px 8px 36px;
                        font-size: 13px;
                    }

                    .input-icon {
                        left: 10px;
                        top: 10px;
                        width: 14px;
                        height: 14px;
                    }

                    .btn-primary {
                        padding: 8px 12px;
                        font-size: 13px;
                    }

                    .step-indicator {
                        width: 25px !important;
                        height: 3px !important;
                    }

                    .price-breakdown span {
                        font-size: 13px;
                    }

                    .checkout-header-row {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 10px !important;
                    }
                    
                    .checkout-header-row button {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>

            <div className="checkout-page">
                <div style={{ marginBottom: '30px' }}>
                    <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>
                        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        Back to Cart
                    </Link>
                </div>

                <div className="checkout-grid">
                    {/* Left Side: Checkout Flow */}
                    <div className="checkout-left">
                        {isDesktop ? (
                            // Desktop Combined View
                            <div className="combined-section">
                                {/* Shipping Address & Personal Details */}
                                <div className="glass glass-card">
                                    <div className="checkout-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MapPin size={20} style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <h2 style={{ fontSize: '20px' }}>Shipping Address & Personal Details</h2>
                                        </div>
                                        {profileData && (
                                            <button 
                                                onClick={handleAutofill}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    borderRadius: '20px',
                                                    padding: '6px 12px',
                                                    color: '#ef4444',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s'
                                                }}
                                                title="Use details from your profile"
                                            >
                                                Use Profile Details
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* Personal Details Section */}
                                        <div>
                                            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-muted)' }}>Personal Information</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div>
                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                        Full Name <span style={{ color: 'var(--primary)' }}>*</span>
                                                    </label>
                                                    <div className="input-icon-wrapper">
                                                        <User className="input-icon" size={18} />
                                                        <input
                                                            type="text"
                                                            value={address.fullName}
                                                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                                                            className="input-field"
                                                            placeholder="John Doe"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                            Phone <span style={{ color: 'var(--primary)' }}>*</span>
                                                        </label>
                                                        <div className="input-icon-wrapper">
                                                            <Phone className="input-icon" size={18} />
                                                            <input
                                                                type="tel"
                                                                value={address.phone}
                                                                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                                                className="input-field"
                                                                placeholder="9876543210"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                            Email <span style={{ color: 'var(--primary)' }}>*</span>
                                                        </label>
                                                        <div className="input-icon-wrapper">
                                                            <Mail className="input-icon" size={18} />
                                                            <input
                                                                type="email"
                                                                value={address.email}
                                                                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                                                className="input-field"
                                                                placeholder="john@example.com"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="checkout-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-muted)' }}>Address Details</h3>
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowMap(true)}
                                                    style={{ 
                                                        background: 'var(--primary)', 
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '6px 16px',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <MapPin size={14} />
                                                    Pinpoint Address on Map
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                            House/Flat No. <span style={{ color: 'var(--primary)' }}>*</span>
                                                        </label>
                                                        <div className="input-icon-wrapper">
                                                            <Home className="input-icon" size={18} />
                                                            <input
                                                                type="text"
                                                                value={address.houseNo}
                                                                onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                                                                className="input-field"
                                                                placeholder="A-101"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                            Street Address <span style={{ color: 'var(--primary)' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={address.street}
                                                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                            className="input-field no-icon"
                                                            placeholder="123 Main St"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                        Landmark <span style={{ color: 'var(--primary)' }}>*</span>
                                                    </label>
                                                    <div className="input-icon-wrapper">
                                                        <MapPinned className="input-icon" size={18} />
                                                        <input
                                                            type="text"
                                                            value={address.landmark}
                                                            onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                                            className="input-field"
                                                            placeholder="Near Central Park"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                            City <span style={{ color: 'var(--primary)' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={address.city}
                                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                            className="input-field no-icon"
                                                            placeholder="Mumbai"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                            Postal Code <span style={{ color: 'var(--primary)' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={address.postalCode}
                                                            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                                            className="input-field no-icon"
                                                            placeholder="400001"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Section */}
                                <div className="glass glass-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <h2 style={{ fontSize: '20px' }}>Payment Method</h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                        {[
                                            { id: 'COD', title: 'Cash on Delivery', icon: <Truck size={20} /> },
                                            { id: 'Online', title: 'Online Payment', icon: <CreditCard size={20} /> }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                style={{
                                                    padding: '15px',
                                                    borderRadius: '10px',
                                                    border: '2px solid',
                                                    borderColor: paymentMethod === method.id ? 'var(--primary)' : 'var(--glass-border)',
                                                    background: paymentMethod === method.id ? 'rgba(236,72,153,0.05)' : 'transparent',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '15px',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <div style={{ color: paymentMethod === method.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                    {method.icon}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{method.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {paymentMethod === 'Online' && (
                                        <div style={{ 
                                            padding: '15px', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            borderRadius: '10px',
                                            marginBottom: '25px',
                                            fontSize: '14px',
                                            color: 'var(--text-muted)',
                                            textAlign: 'center'
                                        }}>
                                            You'll be redirected to our secure payment gateway
                                        </div>
                                    )}

                                    {/* Place Order Button */}
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacing}
                                        className="btn-primary"
                                        style={{ justifyContent: 'center' }}
                                    >
                                        {isPlacing ? 'Processing...' : 'Place Order'} <Zap size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Mobile Stepper View
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <h1 style={{ fontSize: '28px' }}>Checkout</h1>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div className="step-indicator" style={{ width: '40px', height: '4px', borderRadius: '2px', background: step >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
                                        <div className="step-indicator" style={{ width: '40px', height: '4px', borderRadius: '2px', background: step >= 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {step === 1 ? (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                        >
                                            <div className="glass glass-card">
                                                <div className="checkout-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', gap: '15px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <MapPin size={18} style={{ color: 'var(--primary)' }} />
                                                        </div>
                                                        <h2 style={{ fontSize: '18px' }}>Shipping Address</h2>
                                                    </div>
                                                    {profileData && (
                                                        <button 
                                                            onClick={handleAutofill}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                borderRadius: '20px',
                                                                padding: '6px 10px',
                                                                color: '#ef4444',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            Fill from Profile
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    {/* Personal Details Section */}
                                                    <div>
                                                        <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-muted)' }}>Personal Information</h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                            <div>
                                                                <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                    Full Name <span style={{ color: 'var(--primary)' }}>*</span>
                                                                </label>
                                                                <div className="input-icon-wrapper">
                                                                    <User className="input-icon" size={18} />
                                                                    <input
                                                                        type="text"
                                                                        value={address.fullName}
                                                                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                                                                        className="input-field"
                                                                        placeholder="John Doe"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                                <div>
                                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                        Phone <span style={{ color: 'var(--primary)' }}>*</span>
                                                                    </label>
                                                                    <div className="input-icon-wrapper">
                                                                        <Phone className="input-icon" size={18} />
                                                                        <input
                                                                            type="tel"
                                                                            value={address.phone}
                                                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                                                            className="input-field"
                                                                            placeholder="9876543210"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                        Email <span style={{ color: 'var(--primary)' }}>*</span>
                                                                    </label>
                                                                    <div className="input-icon-wrapper">
                                                                        <Mail className="input-icon" size={18} />
                                                                        <input
                                                                            type="email"
                                                                            value={address.email}
                                                                            onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                                                            className="input-field"
                                                                            placeholder="john@example.com"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Address Details Section */}
                                                    <div>
                                                        <div className="checkout-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                            <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-muted)' }}>Address Details</h3>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShowMap(true)}
                                                                style={{ 
                                                                    background: 'var(--primary)', 
                                                                    border: 'none',
                                                                    borderRadius: '20px',
                                                                    padding: '6px 14px',
                                                                    color: 'white',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                                                                }}
                                                            >
                                                                <MapPin size={12} />
                                                                Set on Map
                                                            </button>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                                                <div>
                                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                        House/Flat No. <span style={{ color: 'var(--primary)' }}>*</span>
                                                                    </label>
                                                                    <div className="input-icon-wrapper">
                                                                        <Home className="input-icon" size={18} />
                                                                        <input
                                                                            type="text"
                                                                            value={address.houseNo}
                                                                            onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                                                                            className="input-field"
                                                                            placeholder="A-101"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                        Street Address <span style={{ color: 'var(--primary)' }}>*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={address.street}
                                                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                                        className="input-field no-icon"
                                                                        placeholder="123 Main St"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                    Landmark <span style={{ color: 'var(--primary)' }}>*</span>
                                                                </label>
                                                                <div className="input-icon-wrapper">
                                                                    <MapPinned className="input-icon" size={18} />
                                                                    <input
                                                                        type="text"
                                                                        value={address.landmark}
                                                                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                                                        className="input-field"
                                                                        placeholder="Near Central Park"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                                <div>
                                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                        City <span style={{ color: 'var(--primary)' }}>*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={address.city}
                                                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                                        className="input-field no-icon"
                                                                        placeholder="Mumbai"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                                                                        Postal Code <span style={{ color: 'var(--primary)' }}>*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={address.postalCode}
                                                                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                                                        className="input-field no-icon"
                                                                        placeholder="400001"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setStep(2)}
                                                        className="btn-primary"
                                                        style={{ marginTop: '10px' }}
                                                    >
                                                        Continue to Payment <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                        >
                                            <div className="glass glass-card">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                                                    </div>
                                                    <h2 style={{ fontSize: '20px' }}>Payment Method</h2>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                                    {[
                                                        { id: 'COD', title: 'Cash on Delivery', icon: <Truck size={20} /> },
                                                        { id: 'Online', title: 'Online Payment', icon: <CreditCard size={20} /> }
                                                    ].map(method => (
                                                        <div
                                                            key={method.id}
                                                            onClick={() => setPaymentMethod(method.id)}
                                                            style={{
                                                                padding: '15px',
                                                                borderRadius: '10px',
                                                                border: '2px solid',
                                                                borderColor: paymentMethod === method.id ? 'var(--primary)' : 'var(--glass-border)',
                                                                background: paymentMethod === method.id ? 'rgba(236,72,153,0.05)' : 'transparent',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '15px',
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            <div style={{ color: paymentMethod === method.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                                {method.icon}
                                                            </div>
                                                            <span style={{ fontWeight: '500' }}>{method.title}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {paymentMethod === 'Online' && (
                                                    <div style={{ 
                                                        padding: '15px', 
                                                        background: 'rgba(255,255,255,0.03)', 
                                                        borderRadius: '10px',
                                                        marginBottom: '25px',
                                                        fontSize: '14px',
                                                        color: 'var(--text-muted)',
                                                        textAlign: 'center'
                                                    }}>
                                                        You'll be redirected to our secure payment gateway
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    <button
                                                        onClick={() => setStep(1)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid var(--glass-border)',
                                                            borderRadius: '10px',
                                                            color: 'var(--text-muted)',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        Back
                                                    </button>
                                                    <button
                                                        onClick={handlePlaceOrder}
                                                        disabled={isPlacing}
                                                        className="btn-primary"
                                                        style={{
                                                            flex: 2,
                                                            opacity: isPlacing ? 0.7 : 1
                                                        }}
                                                    >
                                                        {isPlacing ? 'Processing...' : 'Place Order'} <Zap size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="checkout-right">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass glass-card"
                        >
                            <h2 style={{ fontSize: '22px', marginBottom: '25px' }}>Order Summary</h2>

                            <div style={{ marginBottom: '20px', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                                {cartItems.map(item => (
                                    <div key={item.id} className="order-item" style={{ display: 'flex', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                            <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.qty}</div>
                                        </div>
                                        <div style={{ fontWeight: '600', color: 'var(--primary)', whiteSpace: 'nowrap' }}>₹{item.price * item.qty}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="price-breakdown" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                    <span style={{ fontWeight: '500' }}>₹{itemsPrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tax (5%)</span>
                                    <span style={{ fontWeight: '500' }}>₹{taxPrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                                    <span style={{ fontWeight: '500', color: shippingPrice === 0 ? '#10b981' : 'inherit' }}>
                                        {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{totalPrice}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <ShieldCheck size={16} />
                                    <span>Secure Checkout</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <Lock size={16} />
                                    <span>Your information is encrypted</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showMap && (
                    <LocationPicker 
                        onLocationSelect={handleLocationSelect} 
                        onClose={() => setShowMap(false)} 
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Checkout;