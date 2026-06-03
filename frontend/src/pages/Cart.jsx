import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, CreditCard, ShieldCheck, Tag, X, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Cart = () => {
    const {
        cartItems, removeFromCart, updateQty,
        itemsPrice, shippingPrice, taxPrice, totalPrice,
        appliedOffer, discount, couponLoading, applyCoupon, removeCoupon,
        refreshCart
    } = useCart();
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        if (userInfo && userInfo.isDriver) {
            navigate('/driver/dashboard');
        } else if (userInfo) {
            refreshCart();
        }
    }, [userInfo?._id, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }
        const success = await applyCoupon(couponCode.trim());
        if (success) {
            setCouponCode('');
        }
    };

    // If user is not logged in, redirect to login
    if (!userInfo) {
        return (
            <div className="cart-empty-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '0 16px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass cart-empty-card"
                    style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center' }}
                >
                    <div style={{ marginBottom: '30px' }}>
                        <ShoppingBag size={60} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    </div>
                    <h1 style={{ marginBottom: '10px', fontSize: 'clamp(20px, 5vw, 28px)' }}>Please Login First</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px' }}>
                        You need to login to view your cart and place an order.
                    </p>
                    <Link to="/login">
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Go to Login
                        </button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '0 16px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass cart-empty-card"
                    style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center' }}
                >
                    <div style={{ marginBottom: '30px' }}>
                        <ShoppingBag size={60} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    </div>
                    <h1 style={{ marginBottom: '10px', fontSize: 'clamp(20px, 5vw, 28px)' }}>Your Cart is Empty</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px' }}>
                        It looks like you haven't added any items to your cart yet.
                    </p>
                    <Link to="/">
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Explore Menu <ArrowRight size={18} />
                        </button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* Responsive styles for Cart component */
                .cart-page {
                    padding: 40px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .cart-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 30px;
                }

                .cart-left,
                .cart-right {
                    min-width: 0; /* Prevent overflow */
                }

                .cart-right .glass {
                    position: sticky;
                    top: 100px;
                }

                .glass-card {
                    padding: 30px;
                }

                .cart-item {
                    padding: 20px;
                }

                .item-image {
                    width: 100px;
                    height: 100px;
                    border-radius: 10px;
                    overflow: hidden;
                    background: rgba(255,255,255,0.05);
                    flex-shrink: 0;
                }

                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .item-details {
                    flex: 1;
                    min-width: 0; /* Allow text truncation */
                }

                .item-name {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-top: 10px;
                }

                .qty-buttons {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 25px;
                    padding: 5px;
                }

                .qty-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qty-value {
                    font-size: 14px;
                    font-weight: 600;
                    min-width: 20px;
                    text-align: center;
                }

                .remove-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 5px;
                }

                .item-price {
                    text-align: right;
                    white-space: nowrap;
                }

                .item-total {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary);
                }

                .item-unit {
                    font-size: 12px;
                    color: var(--text-muted);
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

                .coupon-section {
                    border-top: 1px solid var(--glass-border);
                    padding-top: 20px;
                    margin-top: 5px;
                    margin-bottom: 20px;
                }

                .coupon-input-wrapper {
                    display: flex;
                    gap: 8px;
                }

                .coupon-input {
                    flex: 1;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    outline: none;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .coupon-input:focus {
                    border-color: #ef4444;
                }

                .coupon-apply-btn {
                    padding: 10px 20px;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 10px;
                    color: #ef4444;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 13px;
                    white-space: nowrap;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .coupon-apply-btn:hover {
                    background: rgba(239, 68, 68, 0.25);
                }

                .coupon-applied-badge {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px dashed rgba(16, 185, 129, 0.3);
                    border-radius: 10px;
                }

                .coupon-remove-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    padding: 2px;
                    display: flex;
                    align-items: center;
                }

                .browse-offers-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    color: #ef4444;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 10px;
                    text-decoration: none;
                    transition: opacity 0.3s;
                }

                .browse-offers-link:hover {
                    opacity: 0.8;
                }

                /* Tablet and below */
                @media (max-width: 768px) {
                    .cart-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }

                    .cart-right .glass {
                        position: static; /* Remove sticky on mobile */
                    }

                    .glass-card,
                    .cart-item {
                        padding: 20px;
                    }

                    .cart-page {
                        padding: 20px 16px;
                    }
                }

                /* Small mobile (down to 280px) */
                @media (max-width: 480px) {
                    .cart-page {
                        padding: 16px 12px;
                    }

                    h1 {
                        font-size: 24px !important;
                    }

                    h2 {
                        font-size: 18px !important;
                    }

                    .cart-item > div {
                        gap: 15px;
                    }

                    .item-image {
                        width: 70px;
                        height: 70px;
                    }

                    .item-name {
                        font-size: 16px;
                    }

                    .quantity-controls {
                        gap: 10px;
                        flex-wrap: wrap;
                    }

                    .qty-buttons {
                        gap: 5px;
                    }

                    .qty-btn {
                        width: 28px;
                        height: 28px;
                    }

                    .item-total {
                        font-size: 18px;
                    }

                    .btn-primary {
                        padding: 10px 16px;
                        font-size: 14px;
                    }

                    .coupon-input-wrapper {
                        flex-direction: column;
                    }
                }

                /* Extra small (down to 280px) */
                @media (max-width: 360px) {
                    .cart-item {
                        padding: 12px;
                    }

                    .item-image {
                        width: 60px;
                        height: 60px;
                    }

                    .item-name {
                        font-size: 15px;
                    }

                    .qty-btn {
                        width: 24px;
                        height: 24px;
                    }

                    .qty-value {
                        font-size: 13px;
                    }

                    .item-total {
                        font-size: 16px;
                    }

                    .item-unit {
                        font-size: 11px;
                    }

                    .btn-primary {
                        padding: 8px 12px;
                        font-size: 13px;
                    }
                }
            `}</style>

            <div className="cart-page">
                <div style={{ marginBottom: '30px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>
                        <ChevronLeft size={18} />
                        Back to Menu
                    </Link>
                </div>

                <div className="cart-grid">
                    {/* Left Side: Cart Items */}
                    <div className="cart-left">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h1 style={{ fontSize: '28px' }}>Shopping Cart <span style={{ color: 'var(--primary)' }}>({cartItems.length})</span></h1>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        variants={itemVariants}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass cart-item"
                                    >
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            {/* Item Image */}
                                            <div className="item-image">
                                                <img src={item.img} alt={item.name} />
                                            </div>

                                            {/* Item Details */}
                                            <div className="item-details">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: item.isVeg ? '#10b981' : '#ef4444',
                                                        boxShadow: item.isVeg ? '0 0 10px #10b981' : '0 0 10px #ef4444'
                                                    }}></div>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.category}</span>
                                                </div>

                                                <h3 className="item-name" style={{
                                                    color: item.isUnavailable ? 'var(--text-muted)' : 'inherit',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px'
                                                }}>
                                                    <span>{item.name}</span>
                                                    {item.isUnavailable &&
                                                        <span style={{
                                                            fontSize: '10px',
                                                            background: 'rgba(239, 68, 68, 0.15)',
                                                            color: '#ef4444',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            display: 'inline-block',
                                                            width: 'fit-content'
                                                        }}>Temporarily Unavailable</span>
                                                    }
                                                </h3>

                                                {/* Quantity Controls */}
                                                <div className="quantity-controls">
                                                    <div className="qty-buttons">
                                                        <button
                                                            onClick={() => !item.isUnavailable && updateQty(item.id, item.qty - 1)}
                                                            className="qty-btn"
                                                            style={{
                                                                opacity: item.isUnavailable || item.qty <= 1 ? 0.3 : 1,
                                                                cursor: item.isUnavailable || item.qty <= 1 ? 'not-allowed' : 'pointer'
                                                            }}
                                                            disabled={item.isUnavailable || item.qty <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="qty-value" style={{ opacity: item.isUnavailable ? 0.5 : 1 }}>{item.qty}</span>
                                                        <button
                                                            onClick={() => !item.isUnavailable && updateQty(item.id, item.qty + 1)}
                                                            className="qty-btn"
                                                            style={{
                                                                opacity: item.isUnavailable ? 0.3 : 1,
                                                                cursor: item.isUnavailable ? 'not-allowed' : 'pointer'
                                                            }}
                                                            disabled={item.isUnavailable}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="remove-btn"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="item-price">
                                                <div className="item-total">₹{item.price * item.qty}</div>
                                                <div className="item-unit">₹{item.price} each</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="cart-right">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass glass-card"
                        >
                            <h2 style={{ fontSize: '22px', marginBottom: '25px' }}>Order Summary</h2>

                            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                    <span style={{ fontWeight: '600' }}>₹{itemsPrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tax (5%)</span>
                                    <span style={{ fontWeight: '600' }}>₹{taxPrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                                    <span style={{ fontWeight: '600', color: shippingPrice === 0 ? '#10b981' : 'inherit' }}>
                                        {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                    </span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="coupon-section">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Tag size={16} color="#ef4444" />
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>Apply Coupon</span>
                                </div>

                                {appliedOffer ? (
                                    <>
                                        <div className="coupon-applied-badge">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Tag size={14} color="#10b981" />
                                                <div>
                                                    <span style={{ fontWeight: '700', color: '#10b981', fontSize: '13px', letterSpacing: '1px' }}>
                                                        {appliedOffer.code}
                                                    </span>
                                                    <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                                        {appliedOffer.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={removeCoupon} className="coupon-remove-btn" title="Remove coupon">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: '12px',
                                            padding: '8px 14px',
                                            background: 'rgba(16, 185, 129, 0.06)',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>Coupon Discount</span>
                                            <span style={{ color: '#10b981', fontWeight: '700' }}>- ₹{discount}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="coupon-input-wrapper">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                placeholder="Enter coupon code"
                                                className="coupon-input"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading}
                                                className="coupon-apply-btn"
                                            >
                                                {couponLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    >
                                                        <Loader2 size={14} />
                                                    </motion.div>
                                                ) : (
                                                    'Apply'
                                                )}
                                            </button>
                                        </div>
                                        <Link to="/offers" className="browse-offers-link">
                                            <Tag size={12} />
                                            Browse available offers
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>
                                <span>Total</span>
                                <div style={{ textAlign: 'right' }}>
                                    {discount > 0 && (
                                        <div style={{ fontSize: '13px', color: '#888', textDecoration: 'line-through', fontWeight: '400', marginBottom: '2px' }}>
                                            ₹{(itemsPrice + shippingPrice + taxPrice).toFixed(2)}
                                        </div>
                                    )}
                                    <span style={{ color: 'var(--primary)' }}>₹{totalPrice}</span>
                                </div>
                            </div>

                            {discount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        textAlign: 'center',
                                        padding: '8px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '8px',
                                        marginBottom: '15px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#10b981'
                                    }}
                                >
                                    🎉 You're saving ₹{discount} on this order!
                                </motion.div>
                            )}

                            <button
                                onClick={() => {
                                    if (userInfo) {
                                        // Check for unavailable items
                                        const unavailableItems = cartItems.filter(item => item.isUnavailable);
                                        if (unavailableItems.length > 0) {
                                            toast.error(`Please remove unavailable items before proceeding: ${unavailableItems.map(i => i.name).join(', ')}`);
                                            return;
                                        }
                                        navigate('/checkout');
                                    } else {
                                        toast.error('Please login to place an order');
                                        navigate('/login?redirect=checkout');
                                    }
                                }}
                                className="btn-primary"
                                style={{
                                    marginBottom: '20px',
                                    opacity: cartItems.some(i => i.isUnavailable) ? 0.7 : 1
                                }}
                            >
                                <CreditCard size={18} style={{ marginRight: '8px' }} />
                                Proceed to Checkout
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <ShieldCheck size={16} />
                                    <span>Secure Checkout</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <ArrowRight size={16} />
                                    <span>Fast Delivery</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Cart;