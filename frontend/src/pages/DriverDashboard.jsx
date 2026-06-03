import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Truck, CheckCircle, Clock, MapPin, 
    Phone, Mail, User, LogOut, Coffee, Activity,
    Navigation as NavIcon, ChevronRight, X, AlertCircle, ShoppingBag,
    DollarSign, Calendar, MapPinned, RefreshCw, History
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';


const DriverDashboard = () => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();
    const [activeOrders, setActiveOrders] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(userInfo?.isAvailable || false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activePage, setActivePage] = useState(1);
    const [activePages, setActivePages] = useState(1);
    const [pastPage, setPastPage] = useState(1);
    const [pastPages, setPastPages] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stats, setStats] = useState({ active: 0, delivered: 0, earnings: 0 });


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!userInfo || !userInfo.isDriver) {
            navigate('/login');
        } else {
            fetchAllOrders();
        }
    }, [userInfo, navigate]);

    const fetchAllOrders = async (showRefreshing = false) => {
        await Promise.all([
            fetchActiveOrders(1, showRefreshing),
            fetchPastOrders(1, showRefreshing)
        ]);
    };

    const fetchActiveOrders = async (pageNumber = 1, showRefreshing = false) => {
        try {
            if (showRefreshing) setIsRefreshing(true);
            else setLoading(true);
            
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/orders/driver/myorders?page=${pageNumber}&limit=10&status=active`, config);
            
            // Safety filter for active orders
            const activeOnly = data.orders.filter(o => ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(o.status));
            setActiveOrders(activeOnly);
            setActivePage(data.page);
            setActivePages(data.pages);
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching active orders:', error);
            toast.error('Failed to load active orders');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchPastOrders = async (pageNumber = 1, showRefreshing = false) => {
        try {
            if (showRefreshing) setIsRefreshing(true);
            // Don't show full page loader for history updates if active orders are loaded
            
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/orders/driver/myorders?page=${pageNumber}&limit=5&status=past`, config);
            
            // Safety filter: ensure history ONLY shows Delivered orders as requested
            const deliveredOnly = data.orders.filter(o => o.status === 'Delivered');
            setPastOrders(deliveredOnly);
            setPastPage(data.page);
            setPastPages(data.pages);
        } catch (error) {
            console.error('Error fetching past orders:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const toggleAvailability = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put('/api/users/availability', { isAvailable: !isAvailable }, config);
            setIsAvailable(data.isAvailable);
            
            // Update userInfo in context/localstorage
            const updatedUserInfo = { ...userInfo, isAvailable: data.isAvailable };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            
            toast.success(data.isAvailable ? "You are now ONLINE! 🚀" : "You are now OFFLINE", {
                icon: data.isAvailable ? '🟢' : '🔴',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/orders/${orderId}/driver/status`, { status }, config);
            toast.success(`Order is now: ${status}`, {
                icon: status === 'Delivered' ? '✅' : '🚚'
            });
            fetchAllOrders(true);
            setSelectedOrder(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Placed': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <Clock size={12}/> },
            'Preparing': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Coffee size={12}/> },
            'Out for Delivery': { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', icon: <Truck size={12}/> },
            'Delivered': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <CheckCircle size={12}/> },
            'Cancelled': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: <X size={12}/> }
        };
        const style = colors[status] || { bg: 'rgba(255,255,255,0.1)', color: '#fff', icon: <Activity size={12}/> };

        return (
            <span style={{
                background: style.bg,
                color: style.color,
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
            }}>
                {style.icon}
                {status}
            </span>
        );
    };

    if (!userInfo || !userInfo.isDriver) return null;

    return (
        <div className="container" style={{ padding: isMobile ? '80px 15px' : '100px 20px', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '40px',
                gap: '20px'
            }}>
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '900', color: 'var(--primary)' }}
                    >
                        Driver <span style={{ color: 'white' }}>Panel</span>
                    </motion.h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Welcome back, <span style={{ color: 'white', fontWeight: '600' }}>{userInfo.name.split(' ')[0]}</span></p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                    {/* Availability Toggle Switch */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            background: isAvailable ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)', 
                            padding: '8px 16px', 
                            borderRadius: '40px', 
                            border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-border)'}`,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <span style={{ color: isAvailable ? '#10b981' : '#ef4444', fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px' }}>
                            {isAvailable ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <div 
                            onClick={toggleAvailability}
                            style={{
                                width: '54px',
                                height: '28px',
                                background: isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                borderRadius: '20px',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s ease',
                                border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                position: 'relative'
                            }}
                        >
                            <motion.div
                                animate={{ 
                                    x: isAvailable ? 26 : 0,
                                    background: isAvailable ? '#10b981' : '#ef4444',
                                    boxShadow: isAvailable ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)'
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                }}
                            />
                        </div>
                    </motion.div>

                    <button
                        onClick={logout}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: '#ef4444',
                            padding: '10px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                        <Truck size={20} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Active Tasks</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
                        {stats.active}
                    </h3>
                </div>
                <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                        <CheckCircle size={20} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Delivered</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
                        {stats.delivered}
                    </h3>
                </div>
                <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                        <DollarSign size={20} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Earnings</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
                        {formatCurrency(stats.earnings)}
                    </h3>
                </div>
                <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                        <Activity size={20} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Efficiency</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>98%</h3>
                </div>
            </div>

            {/* Main Content */}
            <div className="glass" style={{ padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPinned size={24} style={{ color: 'var(--primary)' }} />
                        Assigned & Delivered
                    </h2>
                    <motion.button 
                        whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.15)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchAllOrders(true)} 
                        disabled={isRefreshing}
                        style={{ 
                            background: 'rgba(239, 68, 68, 0.08)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            color: '#ef4444', 
                            cursor: isRefreshing ? 'default' : 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            fontSize: '13px', 
                            fontWeight: '700',
                            padding: '10px 20px',
                            borderRadius: '14px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <RefreshCw size={16} className={isRefreshing ? "spin-animation" : ""} /> 
                        {isRefreshing ? "UPDATING..." : "REFRESH LIST"}
                    </motion.button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(239, 68, 68, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 15px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
                    </div>
                ) : activeOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                        <ShoppingBag size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                        <h3 style={{ fontSize: '18px', color: 'white' }}>No active orders</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '250px', margin: '10px auto' }}>Check back later or make sure you are online!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {activeOrders.map((order) => (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism"
                                style={{
                                    padding: '20px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease',
                                    background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.03)' : 
                                               order.status === 'Out for Delivery' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.02)'
                                }}
                                whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '16px' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                                <User size={14} />
                                                <span style={{ color: 'white', fontWeight: '600' }}>{order.user?.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                                <MapPin size={14} style={{ marginTop: '3px' }} />
                                                <span style={{ lineHeight: '1.4' }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '15px 0' }} />

                                {/* Action Buttons Area - Only show for actual active deliveries */}
                                {order.status !== 'Delivered' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.shippingAddress?.lat ? `${order.shippingAddress.lat},${order.shippingAddress.lng}` : encodeURIComponent(`${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}${order.shippingAddress?.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                padding: '12px 15px',
                                                borderRadius: '14px',
                                                border: 'none',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                textDecoration: 'none',
                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                            }}
                                            title="Open destination in Google Maps"
                                        >
                                            <NavIcon size={18} />
                                            <span>Navigate to Destination</span>
                                        </a>
                                    </div>
                                )}

                                {order.status === 'Out for Delivery' && (
                                    <div style={{ marginTop: '12px' }}>
                                        <motion.div 
                                            animate={{ scale: [1, 1.02, 1] }} 
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}
                                        >
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                                            Active Delivery
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* Pagination for Active Orders */}
                        {activePages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    disabled={activePage === 1}
                                    onClick={() => fetchActiveOrders(activePage - 1)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: activePage === 1 ? 'not-allowed' : 'pointer', opacity: activePage === 1 ? 0.3 : 1 }}
                                >
                                    Previous
                                </button>
                                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    Page {activePage} of {activePages}
                                </span>
                                <button 
                                    disabled={activePage === activePages}
                                    onClick={() => fetchActiveOrders(activePage + 1)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: activePage === activePages ? 'not-allowed' : 'pointer', opacity: activePage === activePages ? 0.3 : 1 }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Past Deliveries Section */}
            {!loading && pastOrders.length > 0 && (
                <div className="glass" style={{ padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid var(--glass-border)', marginTop: '40px' }}>
                    <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <History size={24} style={{ color: '#10b981' }} />
                                Past Delivered History
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '5px' }}>Archive of your successfully completed deliveries</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pastOrders.map((order) => (
                            <motion.div
                                key={order._id}
                                className="glass-morphism"
                                style={{
                                    padding: '15px 20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }}
                                whileHover={{ opacity: 1, background: 'rgba(255,255,255,0.03)' }}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div>
                                        <p style={{ fontWeight: '700', fontSize: '14px' }}>#{order._id.slice(-6).toUpperCase()}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatDate(order.createdAt)}</p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: '800', fontSize: '14px', color: 'white' }}>{formatCurrency(order.totalPrice)}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{order.orderItems.length} items</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination for Past Orders */}
                    {pastPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '25px' }}>
                            <button 
                                disabled={pastPage === 1}
                                onClick={() => fetchPastOrders(pastPage - 1)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: pastPage === 1 ? 'not-allowed' : 'pointer', opacity: pastPage === 1 ? 0.3 : 1 }}
                            >
                                Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                Page {pastPage} of {pastPages}
                            </span>
                            <button 
                                disabled={pastPage === pastPages}
                                onClick={() => fetchPastOrders(pastPage + 1)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: pastPage === pastPages ? 'not-allowed' : 'pointer', opacity: pastPage === pastPages ? 0.3 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass"
                            style={{
                                maxWidth: '500px',
                                width: '100%',
                                padding: '30px',
                                borderRadius: '32px',
                                position: 'relative',
                                background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>

                            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>Delivery Details</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>Order #{selectedOrder._id.slice(-6).toUpperCase()}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* User Contact */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px' }}>
                                    <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} /> Customer Info
                                    </h4>
                                    <p style={{ fontWeight: '700', fontSize: '18px', marginBottom: '5px' }}>{selectedOrder.user?.name}</p>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        <a href={`tel:${selectedOrder.user?.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                                            <Phone size={14} /> Call
                                        </a>
                                        <a href={`mailto:${selectedOrder.user?.email}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                                            <Mail size={14} /> Email
                                        </a>
                                    </div>
                                </div>

                                {/* Address */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px' }}>
                                    <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} /> Delivery Address
                                    </h4>
                                    <p style={{ lineHeight: '1.6', fontSize: '15px' }}>
                                        {selectedOrder.shippingAddress?.address}<br />
                                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                                    </p>
                                    <div style={{ marginTop: '15px' }}>
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.shippingAddress?.lat ? `${selectedOrder.shippingAddress.lat},${selectedOrder.shippingAddress.lng}` : encodeURIComponent(`${selectedOrder.shippingAddress?.address || ''}, ${selectedOrder.shippingAddress?.city || ''}${selectedOrder.shippingAddress?.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}`)}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                color: 'white', 
                                                textDecoration: 'none', 
                                                fontSize: '16px', 
                                                fontWeight: '800', 
                                                padding: '14px', 
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                                borderRadius: '16px', 
                                                justifyContent: 'center', 
                                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                                                width: '100%'
                                            }}
                                            title="Open Navigation in Google Maps"
                                        >
                                            <NavIcon size={20} /> Start Navigation
                                        </a>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px' }}>
                                    <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px' }}>Items</h4>
                                    {selectedOrder.orderItems.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                            <span><span style={{ color: 'var(--primary)', fontWeight: '700' }}>{item.qty}x</span> {item.name}</span>
                                            <span>{formatCurrency(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                                        <span>Total</span>
                                        <span style={{ color: '#10b981' }}>{formatCurrency(selectedOrder.totalPrice)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ marginTop: '10px' }}>
                                    {selectedOrder.status === 'Preparing' && (
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder._id, 'Out for Delivery')}
                                            style={{ width: '100%', padding: '15px', background: 'var(--primary)', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <Truck size={20} /> Mark Picked Up
                                        </button>
                                    )}
                                    {selectedOrder.status === 'Out for Delivery' && (
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder._id, 'Delivered')}
                                            style={{ width: '100%', padding: '15px', background: '#10b981', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <CheckCircle size={20} /> Mark Delivered
                                        </button>
                                    )}
                                    {selectedOrder.status === 'Delivered' && (
                                        <div style={{ textAlign: 'center', color: '#10b981', fontWeight: '700', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
                                            Delivery Completed 🎉
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                .glass-morphism {
                    backdrop-filter: blur(16px) saturate(180%);
                    -webkit-backdrop-filter: blur(16px) saturate(180%);
                    background-color: rgba(17, 25, 40, 0.75);
                }
            `}</style>
        </div>
    );
};

export default DriverDashboard;
