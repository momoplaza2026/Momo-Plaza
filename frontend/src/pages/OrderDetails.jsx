import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, MapPin, ArrowRight, Package, Truck, ChefHat, Star, ShieldCheck, Utensils, ArrowUpRight, Search, ChevronRight, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [fetchingOrders, setFetchingOrders] = useState(true);

    const { userInfo } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!userInfo || !userInfo.token) {
                setLoading(false);
                setFetchingOrders(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            // Fetch current order
            try {
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }

            // Fetch order history
            try {
                const { data } = await axios.get('/api/orders/myorders', config);
                // Filter out the current order to only show PREVIOUS orders
                const history = Array.isArray(data) ? data.filter(o => o._id !== id) : [];
                setOrders(history);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setFetchingOrders(false);
            }
        };
        fetchData();
    }, [id, userInfo]);

    if (loading) return (
        <div style={styles.loadingScreen} className="loadingScreen">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                style={styles.spinner}
            />
            <span style={styles.loadingText}>Loading Order...</span>
        </div>
    );

    if (!order) return (
        <div style={styles.loadingScreen} className="loadingScreen">
            <h2 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 24 }}>Order Not Found</h2>
            <Link to="/" style={styles.primaryBtn} className="primaryBtn">← Back to Home</Link>
        </div>
    );

    // Mock data based on the image - replace with actual order data
    const mockOrder = {
        ...order,
        _id: order._id || 'AB4EFC55',
        shippingAddress: order.shippingAddress || {
            address: '8, 8 no pashupati bhattacharya road, vdfbfbf',
            city: 'Kolkata',
            postalCode: '700034',
        },
        paymentMethod: order.paymentMethod || 'Online',
        isPaid: order.isPaid || false,
        itemsPrice: order.itemsPrice || "000",
        taxPrice: order.taxPrice || "00.00",
        totalPrice: order.totalPrice || "000.00",
        orderItems: order.orderItems?.length ? order.orderItems : [
            { name: 'Paneer Tikka', qty: 1, price: 320, image: 'https://via.placeholder.com/60' },
            { name: 'Veg Hakka Noodles', qty: 1, price: 280, image: 'https://via.placeholder.com/60' },
            { name: 'Dal Makhani Rice', qty: 1, price: 349, image: 'https://via.placeholder.com/60' },
        ]
    };

    const getStatusIndex = (status) => {
        const statuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
        return statuses.indexOf(status);
    };

    const currentStatusIndex = order.isDelivered ? 3 : getStatusIndex(order.status || 'Placed');

    const steps = [
        { label: 'ORDER PLACED', icon: Package, done: currentStatusIndex >= 0 },
        { label: 'CHEF COOKING', icon: ChefHat, done: currentStatusIndex >= 1 },
        { label: 'OUT FOR DELIVERY', icon: Truck, done: currentStatusIndex >= 2 },
        { label: 'DELIVERED', icon: CheckCircle, done: currentStatusIndex >= 3 },
    ];

    return (
        <div style={styles.page} className="page">
            <div style={styles.container} className="container">

                {/* Header with Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.header}
                    className="header"
                >

                    <div style={styles.badgeRow} className="badgeRow">
                        <span style={styles.activeBadge} className="activeBadge">● Live Tracking</span>
                        <span style={styles.orderIdBadge} className="orderIdBadge">#{mockOrder._id?.slice(-8).toUpperCase() || 'AB4EFC55'}</span>
                    </div>
                </motion.div>

                {/* ETA Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={styles.etaSection}
                    className="etaSection"
                >

                </motion.div>

                {/* Divider */}
                <div style={styles.divider} className="divider" />

                {/* Title */}
                <h1 style={styles.heroTitle} className="heroTitle">
                    Order <span style={styles.heroAccent} className="heroAccent">Details</span>
                </h1>

                <div style={styles.grid} className="grid">
                    {/* LEFT COLUMN */}
                    <div style={styles.leftCol} className="leftCol">

                        {/* Progress Tracker */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={styles.card}
                            className="card"
                        >
                            <p style={styles.cardLabel} className="cardLabel">TRACKING STATUS</p>
                            <div style={styles.stepsRow} className="stepsRow">
                                {steps.map((step, i) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={i} style={styles.stepItem} className="stepItem">
                                            <div style={{
                                                ...styles.stepIcon,
                                                background: step.done ? '#E8192C' : '#1a1a1a',
                                                border: step.done ? '2px solid #E8192C' : '2px solid #2a2a2a',
                                                boxShadow: step.done ? '0 0 20px rgba(232,25,44,0.4)' : 'none'
                                            }} className="stepIcon">
                                                <Icon size={18} color={step.done ? '#fff' : '#444'} />
                                            </div>
                                            <span style={{
                                                ...styles.stepLabel,
                                                color: step.done ? '#fff' : '#444'
                                            }} className="stepLabel">{step.label}</span>
                                            {i < steps.length - 1 && (
                                                <div style={{
                                                    ...styles.stepConnector,
                                                    background: step.done ? '#E8192C' : '#1e1e1e'
                                                }} className="stepConnector" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Delivery Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={styles.card}
                            className="card"
                        >
                            <p style={styles.cardLabel} className="cardLabel">DELIVERY ADDRESS</p>
                            <div style={styles.addressBlock} className="addressBlock">
                                <MapPin size={18} color="#E8192C" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <p style={styles.addressLine} className="addressLine">{mockOrder.shippingAddress.address}</p>
                                    <p style={styles.addressSub} className="addressSub">
                                        {mockOrder.shippingAddress.city}, West Bengal — {mockOrder.shippingAddress.postalCode}
                                    </p>
                                </div>
                            </div>
                            <div style={styles.verifiedRow} className="verifiedRow">
                                <ShieldCheck size={14} color="#22c55e" />
                                <span style={styles.verifiedText} className="verifiedText">ADDRESS VERIFIED</span>
                            </div>
                        </motion.div>

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={styles.card}
                            className="card"
                        >
                            <div style={styles.cardHeader} className="cardHeader">
                                <p style={styles.cardLabel} className="cardLabel">YOUR ORDER</p>
                                <span style={styles.itemCount} className="itemCount">{mockOrder.orderItems.length} items</span>
                            </div>

                            <div style={styles.itemsList} className="itemsList">
                                {mockOrder.orderItems.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.08 }}
                                        style={styles.orderItem}
                                        className="orderItem"
                                    >
                                        <img src={item.image} alt={item.name} style={styles.itemImg} className="itemImg" />
                                        <div style={styles.itemInfo} className="itemInfo">
                                            <p style={styles.itemName} className="itemName">{item.name}</p>
                                        </div>
                                        <p style={styles.itemPrice} className="itemPrice">₹{item.price * item.qty}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={styles.rightCol} className="rightCol">

                        {/* Payment Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={styles.card}
                            className="card"
                        >
                            <p style={styles.cardLabel} className="cardLabel">PAYMENT SUMMARY</p>

                            <div style={styles.summaryRows} className="summaryRows">
                                <div style={styles.summaryRow} className="summaryRow">
                                    <span style={styles.summaryKey} className="summaryKey">Method</span>
                                    <span style={styles.summaryVal} className="summaryVal">{mockOrder.paymentMethod}</span>
                                </div>
                                <div style={styles.summaryRow} className="summaryRow">
                                    <span style={styles.summaryKey} className="summaryKey">Status</span>
                                    <span style={{
                                        ...styles.summaryVal,
                                        color: mockOrder.isPaid ? '#22c55e' : '#f59e0b',
                                        fontWeight: 700
                                    }} className="summaryVal">
                                        {mockOrder.isPaid ? 'Paid ✓' : 'Pending'}
                                    </span>
                                </div>
                                <div style={styles.summaryRow} className="summaryRow">
                                    <span style={styles.summaryKey} className="summaryKey">Subtotal</span>
                                    <span style={styles.summaryVal} className="summaryVal">₹{mockOrder.itemsPrice}</span>
                                </div>
                                <div style={styles.summaryRow} className="summaryRow">
                                    <span style={styles.summaryKey} className="summaryKey">Tax</span>
                                    <span style={styles.summaryVal} className="summaryVal">₹{mockOrder.taxPrice}</span>
                                </div>
                                <div style={styles.summaryRow} className="summaryRow">
                                    <span style={styles.summaryKey} className="summaryKey">Delivery</span>
                                    <span style={{ ...styles.summaryVal, color: '#22c55e' }} className="summaryVal">Free</span>
                                </div>
                            </div>

                            <div style={styles.totalRow} className="totalRow">
                                <span style={styles.totalLabel} className="totalLabel">TOTAL</span>
                                <span style={styles.totalAmount} className="totalAmount">₹{mockOrder.totalPrice}</span>
                            </div>
                        </motion.div>

                        {/* CTA Button */}
                        <Link to="/" style={styles.ctaBtn} className="ctaBtn">
                            Back to Home
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Previous Order History Section */}
                <div style={{ marginTop: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(232,25,44,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <History size={20} color="#E8192C" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>Previous <span style={{ color: '#E8192C' }}>Orders</span></h2>
                    </div>

                    {fetchingOrders ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#555' }}>
                            <p>Scanning your order history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{ padding: 40, background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', textAlign: 'center' }}>
                            <Package size={40} color="#333" style={{ marginBottom: 16 }} />
                            <p style={{ color: '#555', fontWeight: 600 }}>No previous orders found in your vault.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                            {orders.slice(0, 6).map((prevOrder) => (
                                <motion.div
                                    key={prevOrder._id}
                                    whileHover={{ y: -4 }}
                                    style={{
                                        background: '#111',
                                        border: '1px solid #1e1e1e',
                                        borderRadius: 20,
                                        padding: 20,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 15,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#555', fontFamily: 'monospace' }}>#{prevOrder._id.slice(-8).toUpperCase()}</span>
                                        <div style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            padding: '4px 10px',
                                            borderRadius: 8,
                                            background: prevOrder.status === 'Delivered' ? 'rgba(34,197,94,0.1)' : 'rgba(232,25,44,0.1)',
                                            color: prevOrder.status === 'Delivered' ? '#22c55e' : '#E8192C'
                                        }}>
                                            {prevOrder.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                                            {new Date(prevOrder.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                                            {prevOrder.orderItems.length} {prevOrder.orderItems.length === 1 ? 'Item' : 'Items'} • ₹{prevOrder.totalPrice}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/order/${prevOrder._id}`)}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid #1e1e1e',
                                            borderRadius: 12,
                                            padding: '10px',
                                            color: '#fff',
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        View Details <ChevronRight size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Responsive Styles - Optimized for all devices */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                /* Large Mobile (481px - 768px) */
                @media (min-width: 481px) and (max-width: 768px) {
                    .container {
                        padding: 0 24px !important;
                    }
                    
                    .logo {
                        font-size: 28px !important;
                    }
                    
                    .searchBar {
                        padding: 10px 16px !important;
                    }
                    
                    .heroTitle {
                        font-size: 42px !important;
                    }
                    
                    .card {
                        padding: 24px !important;
                    }
                }

                /* Medium Mobile (376px - 480px) */
                @media (min-width: 376px) and (max-width: 480px) {
                    .container {
                        padding: 0 20px !important;
                    }
                    
                    .logo {
                        font-size: 24px !important;
                    }
                    
                    .searchBar {
                        padding: 8px 14px !important;
                        font-size: 12px !important;
                    }
                    
                    .heroTitle {
                        font-size: 36px !important;
                    }
                    
                    .etaValue {
                        font-size: 32px !important;
                    }
                    
                    .card {
                        padding: 20px !important;
                    }
                    
                    .stepItem {
                        min-width: 70px !important;
                    }
                    
                    .stepIcon {
                        width: 40px !important;
                        height: 40px !important;
                    }
                    
                    .stepLabel {
                        font-size: 8px !important;
                    }
                    
                    .stepConnector {
                        top: 20px !important;
                        width: calc(100% - 40px) !important;
                    }
                    
                    .orderItem {
                        gap: 12px !important;
                    }
                    
                    .itemImg {
                        width: 48px !important;
                        height: 48px !important;
                    }
                    
                    .itemName {
                        font-size: 14px !important;
                    }
                    
                    .totalAmount {
                        font-size: 28px !important;
                    }
                }

                /* Small Mobile (321px - 375px) */
                @media (min-width: 321px) and (max-width: 375px) {
                    .container {
                        padding: 0 16px !important;
                    }
                    
                    .logo {
                        font-size: 22px !important;
                    }
                    
                    .searchBar {
                        padding: 6px 12px !important;
                        font-size: 11px !important;
                    }
                    
                    .searchIcon {
                        font-size: 12px !important;
                    }
                    
                    .badgeRow {
                        gap: 8px !important;
                    }
                    
                    .activeBadge, .orderIdBadge {
                        font-size: 10px !important;
                        padding: 4px 10px !important;
                    }
                    
                    .heroTitle {
                        font-size: 32px !important;
                    }
                    
                    .etaSection {
                        margin: 16px 0 !important;
                    }
                    
                    .etaLabel {
                        font-size: 11px !important;
                    }
                    
                    .etaValue {
                        font-size: 28px !important;
                    }
                    
                    .etaUnit {
                        font-size: 16px !important;
                    }
                    
                    .card {
                        padding: 18px !important;
                    }
                    
                    .cardLabel {
                        font-size: 10px !important;
                        margin-bottom: 16px !important;
                    }
                    
                    .stepsRow {
                        gap: 0 !important;
                    }
                    
                    .stepItem {
                        min-width: 65px !important;
                    }
                    
                    .stepIcon {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    
                    .stepIcon svg {
                        width: 14px !important;
                        height: 14px !important;
                    }
                    
                    .stepLabel {
                        font-size: 7px !important;
                        letter-spacing: 0.02em !important;
                    }
                    
                    .stepConnector {
                        top: 18px !important;
                        width: calc(100% - 36px) !important;
                    }
                    
                    .orderItem {
                        gap: 10px !important;
                        padding: 12px 0 !important;
                    }
                    
                    .itemImg {
                        width: 44px !important;
                        height: 44px !important;
                    }
                    
                    .itemName {
                        font-size: 13px !important;
                    }
                    
                    .itemPrice {
                        font-size: 14px !important;
                    }
                    
                    .addressLine {
                        font-size: 13px !important;
                    }
                    
                    .addressSub {
                        font-size: 10px !important;
                    }
                    
                    .verifiedText {
                        font-size: 9px !important;
                    }
                    
                    .summaryKey, .summaryVal {
                        font-size: 11px !important;
                    }
                    
                    .totalLabel {
                        font-size: 12px !important;
                    }
                    
                    .totalAmount {
                        font-size: 24px !important;
                    }
                    
                    .ctaBtn {
                        padding: 14px 20px !important;
                        font-size: 12px !important;
                    }
                }

                /* Extra Small Mobile (280px - 320px) */
                @media (max-width: 320px) {
                    .container {
                        padding: 0 12px !important;
                    }
                    
                    .logo {
                        font-size: 20px !important;
                    }
                    
                    .searchBar {
                        padding: 5px 10px !important;
                        font-size: 10px !important;
                        gap: 4px !important;
                    }
                    
                    .searchIcon {
                        font-size: 10px !important;
                    }
                    
                    .badgeRow {
                        gap: 6px !important;
                        flex-wrap: wrap !important;
                    }
                    
                    .activeBadge, .orderIdBadge {
                        font-size: 9px !important;
                        padding: 3px 8px !important;
                    }
                    
                    .heroTitle {
                        font-size: 28px !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .etaSection {
                        margin: 12px 0 !important;
                    }
                    
                    .etaLabel {
                        font-size: 10px !important;
                    }
                    
                    .etaValue {
                        font-size: 24px !important;
                    }
                    
                    .etaUnit {
                        font-size: 14px !important;
                    }
                    
                    .divider {
                        margin: 16px 0 24px !important;
                    }
                    
                    .card {
                        padding: 16px !important;
                        border-radius: 16px !important;
                    }
                    
                    .cardLabel {
                        font-size: 9px !important;
                        margin-bottom: 14px !important;
                    }
                    
                    .stepsRow {
                        gap: 0 !important;
                    }
                    
                    .stepItem {
                        min-width: 55px !important;
                    }
                    
                    .stepIcon {
                        width: 32px !important;
                        height: 32px !important;
                        border-width: 1.5px !important;
                    }
                    
                    .stepIcon svg {
                        width: 12px !important;
                        height: 12px !important;
                    }
                    
                    .stepLabel {
                        font-size: 6px !important;
                        line-height: 1.2 !important;
                    }
                    
                    .stepConnector {
                        top: 16px !important;
                        width: calc(100% - 32px) !important;
                        height: 1.5px !important;
                    }
                    
                    .cardHeader {
                        margin-bottom: 12px !important;
                    }
                    
                    .itemCount {
                        font-size: 9px !important;
                        padding: 2px 8px !important;
                    }
                    
                    .orderItem {
                        gap: 8px !important;
                        padding: 10px 0 !important;
                    }
                    
                    .itemImg {
                        width: 40px !important;
                        height: 40px !important;
                    }
                    
                    .itemName {
                        font-size: 12px !important;
                    }
                    
                    .itemPrice {
                        font-size: 13px !important;
                    }
                    
                    .addressBlock {
                        gap: 8px !important;
                        margin-bottom: 12px !important;
                    }
                    
                    .addressLine {
                        font-size: 12px !important;
                        word-break: break-word !important;
                    }
                    
                    .addressSub {
                        font-size: 9px !important;
                    }
                    
                    .verifiedRow {
                        padding: 4px 8px !important;
                    }
                    
                    .verifiedText {
                        font-size: 8px !important;
                    }
                    
                    .summaryRows {
                        gap: 8px !important;
                        padding-bottom: 12px !important;
                        margin-bottom: 12px !important;
                    }
                    
                    .summaryKey, .summaryVal {
                        font-size: 10px !important;
                    }
                    
                    .totalLabel {
                        font-size: 11px !important;
                    }
                    
                    .totalAmount {
                        font-size: 22px !important;
                    }
                    
                    .ctaBtn {
                        padding: 12px 16px !important;
                        font-size: 11px !important;
                        border-radius: 14px !important;
                    }
                }

                /* 280px specific fixes */
                @media (max-width: 280px) {
                    .stepItem {
                        min-width: 48px !important;
                    }
                    
                    .stepIcon {
                        width: 28px !important;
                        height: 28px !important;
                    }
                    
                    .stepIcon svg {
                        width: 10px !important;
                        height: 10px !important;
                    }
                    
                    .stepLabel {
                        font-size: 5px !important;
                    }
                    
                    .stepConnector {
                        top: 14px !important;
                        width: calc(100% - 28px) !important;
                    }
                    
                    .itemImg {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    
                    .itemName {
                        font-size: 11px !important;
                    }
                    
                    .itemPrice {
                        font-size: 12px !important;
                    }
                    
                    .totalAmount {
                        font-size: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        paddingTop: 80,
        paddingBottom: 60,
    },
    container: {
   
        margin: '0 auto',
        padding: '0 24px',
    },
    loadingScreen: {
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    spinner: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '3px solid #1a1a1a',
        borderTopColor: '#E8192C',
    },
    loadingText: {
        color: '#555',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
    },
    logo: {
        fontSize: 32,
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-1px',
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: 30,
        padding: '10px 20px',
        color: '#555',
        fontSize: 13,
    },
    searchIcon: {
        fontSize: 14,
    },
    searchText: {
        color: '#555',
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    activeBadge: {
        background: 'rgba(232,25,44,0.12)',
        color: '#E8192C',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        padding: '5px 12px',
        borderRadius: 20,
        border: '1px solid rgba(232,25,44,0.25)',
    },
    orderIdBadge: {
        color: '#444',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        fontFamily: 'monospace',
    },
    etaSection: {
        marginBottom: 24,
    },
    etaLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: '#555',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    etaValue: {
        fontSize: 42,
        fontWeight: 900,
        letterSpacing: '-2px',
        color: '#fff',
        lineHeight: 1,
    },
    etaUnit: {
        fontSize: 20,
        color: '#555',
        fontWeight: 600,
    },
    heroTitle: {
        fontSize: 'clamp(36px, 5vw, 56px)',
        fontWeight: 900,
        letterSpacing: '-2px',
        lineHeight: 1.05,
        color: '#fff',
        marginBottom: 24,
    },
    heroAccent: {
        color: '#E8192C',
    },
    divider: {
        height: 1,
        background: '#1a1a1a',
        marginBottom: 24,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: 24,
        alignItems: 'start',
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    rightCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    card: {
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: 20,
        padding: 28,
    },
    cardLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: '#555',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    itemCount: {
        background: '#1a1a1a',
        color: '#666',
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 12px',
        borderRadius: 20,
        letterSpacing: '0.1em',
    },

    // Steps
    stepsRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
        position: 'relative',
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        position: 'relative',
        gap: 8,
    },
    stepIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1.4,
    },
    stepConnector: {
        position: 'absolute',
        top: 24,
        left: '50%',
        width: '100%',
        height: 2,
        zIndex: 0,
    },

    // Order Items
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 0',
        borderBottom: '1px solid #1a1a1a',
    },
    itemImg: {
        width: 60,
        height: 60,
        borderRadius: 14,
        objectFit: 'cover',
        border: '1px solid #1e1e1e',
        flexShrink: 0,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-0.3px',
    },
    itemPrice: {
        fontSize: 17,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-0.5px',
        whiteSpace: 'nowrap',
    },

    // Address
    addressBlock: {
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    addressLine: {
        fontSize: 15,
        fontWeight: 700,
        color: '#fff',
        marginBottom: 4,
        lineHeight: 1.4,
    },
    addressSub: {
        fontSize: 12,
        color: '#555',
        fontWeight: 500,
    },
    verifiedRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: 10,
        padding: '8px 12px',
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: 700,
        color: '#22c55e',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },

    // Payment
    summaryRows: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingBottom: 20,
        borderBottom: '1px solid #1a1a1a',
        marginBottom: 20,
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryKey: {
        fontSize: 13,
        color: '#555',
        fontWeight: 500,
    },
    summaryVal: {
        fontSize: 13,
        color: '#ccc',
        fontWeight: 600,
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 700,
        color: '#888',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-1px',
    },

    // CTA
    ctaBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: '#E8192C',
        color: '#fff',
        borderRadius: 16,
        padding: '16px 24px',
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: '0.05em',
        textDecoration: 'none',
        transition: 'background 0.2s, transform 0.15s',
        textAlign: 'center',
    },
    primaryBtn: {
        display: 'inline-block',
        background: '#E8192C',
        color: '#fff',
        borderRadius: 12,
        padding: '14px 28px',
        fontWeight: 700,
        fontSize: 14,
        textDecoration: 'none',
    },
};

export default OrderDetails;