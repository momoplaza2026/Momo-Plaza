import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Users, TrendingUp, Search,
    ShoppingCart, Eye, DollarSign, Calendar, User,
    ChevronDown, ChevronUp, X, Mail, Phone, MapPin,
    ShoppingBag, Activity, AlertCircle, LogOut, Clock,
    CheckCircle, XCircle, Truck, Coffee, Filter,
    CreditCard, Home, Map, Download, Printer, Menu,
    Tag, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Percent,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { requestForToken } from '../firebase';

const AdminPanel = () => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeCarts: 0,
        todayStats: {
            orders: 0,
            revenue: 0
        },
        orderStatusBreakdown: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [expandedUsers, setExpandedUsers] = useState({});
    const [expandedOrderHistory, setExpandedOrderHistory] = useState({});
    const [error, setError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    
    // Order Pagination
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPages, setOrdersPages] = useState(1);
    const [ordersLimit] = useState(5);
    
    // Offers state
    const [offers, setOffers] = useState([]);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [offerForm, setOfferForm] = useState({
        title: '', description: '', code: '', discountType: 'percentage',
        discountValue: '', minOrderAmount: '', maxDiscount: '', color: '#ef4444',
        isActive: true, validFrom: '', validUntil: '', usageLimit: ''
    });

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: null, name: '' });

    // Menu state
    const [menuItems, setMenuItems] = useState([]);
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [menuForm, setMenuForm] = useState({
        name: '', category: '', price: '', img: '', isVeg: true
    });
    const [menuSearchTerm, setMenuSearchTerm] = useState('');

    // Driver state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [drivers, setDrivers] = useState([]);
    const [showDriverForm, setShowDriverForm] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [driverForm, setDriverForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [assigningDriver, setAssigningDriver] = useState(null); // Selected order for assignment

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/');
        } else {
            fetchDashboardData();
            fetchOffers();
            fetchMenuItems();
            fetchDrivers();
        }
    }, [userInfo, navigate]);

    const fetchMenuItems = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/menu/admin/all', config);
            setMenuItems(Array.isArray(data) ? data : []);
        } catch (err) { console.error('Error fetching menu items:', err); setMenuItems([]); }
    };

    const fetchDrivers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/users/drivers', config);
            setDrivers(data);
        } catch (err) {
            console.error('Error fetching drivers:', err);
        }
    };

    const handleSaveDriver = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            if (editingDriver) {
                await axios.put(`/api/users/drivers/${editingDriver}`, driverForm, config);
                toast.success('Driver profile updated');
            } else {
                await axios.post('/api/users/drivers', driverForm, config);
                toast.success('Driver registered successfully');
            }
            resetDriverForm();
            fetchDrivers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save driver');
        }
    };

    const handleEditDriver = (driver) => {
        setDriverForm({
            name: driver.name,
            email: driver.email,
            phone: driver.phone || '',
            password: '' // Keep empty unless updating
        });
        setEditingDriver(driver._id);
        setShowDriverForm(true);
    };

    const resetDriverForm = () => {
        setDriverForm({ name: '', email: '', password: '', phone: '' });
        setEditingDriver(null);
        setShowDriverForm(false);
    };


    const resetMenuForm = () => {
        setMenuForm({ name: '', category: '', price: '', img: '', isVeg: true });
        setEditingMenuItem(null);
        setShowMenuForm(false);
    };

    const handleEditMenuItem = (item) => {
        setMenuForm({
            name: item.name, category: item.category, price: item.price,
            img: item.img, isVeg: item.isVeg
        });
        setEditingMenuItem(item._id);
        setShowMenuForm(true);
    };

    const handleSaveMenuItem = async () => {
        if (!menuForm.name || !menuForm.category || !menuForm.price || !menuForm.img) {
            toast.error('All fields including image URL are required');
            return;
        }
        try {
            const payload = { ...menuForm, price: Number(menuForm.price) };
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            
            if (editingMenuItem) {
                const menuId = String(editingMenuItem).trim();
                // console.log('Updating item:', menuId);
                const response = await axios.put(`/api/menu/${menuId}`, payload, config);
                // console.log('Update response:', response.data);
                toast.success('Food item updated successfully');
            } else {
                // console.log('Creating new item:', payload.name);
                const response = await axios.post('/api/menu', payload, config);
                // console.log('Create response:', response.data);
                toast.success('Food item added successfully');
            }
            resetMenuForm();
            fetchMenuItems();
        } catch (err) { 
            // console.error('Menu save error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save menu item';
            toast.error(errorMsg); 
        }
    };

    const handleDeleteMenuItem = (item) => {
        setDeleteModal({ 
            show: true, 
            type: 'menu', 
            id: item._id, 
            name: item.name 
        });
    };

    const handleToggleAvailability = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.patch(`/api/menu/${id}/toggle`, {}, config);
            toast.success('Availability updated');
            fetchMenuItems();
        } catch (err) {
            // console.error('Toggle error:', err);
            toast.error('Failed to update availability');
        }
    };

    const fetchOrders = async (page = 1) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/admin/orders?page=${page}&limit=${ordersLimit}`, config);
            setOrders(data.orders || []);
            setOrdersPage(data.pagination?.page || 1);
            setOrdersPages(data.pagination?.pages || 1);
        } catch (err) {
            // console.error('Error fetching orders:', err);
            toast.error('Failed to fetch orders');
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const usersResponse = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setUsers(usersResponse.data);

            const statsResponse = await axios.get('/api/admin/stats', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStats(statsResponse.data);

            await fetchOrders(1);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {
            const { data } = await axios.get('/api/offers/admin/all', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setOffers(data);
        } catch (err) { console.error('Error fetching offers:', err); }
    };

    const resetOfferForm = () => {
        setOfferForm({ title: '', description: '', code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', color: '#ef4444', isActive: true, validFrom: '', validUntil: '', usageLimit: '' });
        setEditingOffer(null);
        setShowOfferForm(false);
    };

    const handleEditOffer = (offer) => {
        setOfferForm({
            title: offer.title, description: offer.description, code: offer.code,
            discountType: offer.discountType, discountValue: offer.discountValue,
            minOrderAmount: offer.minOrderAmount || '', maxDiscount: offer.maxDiscount || '',
            color: offer.color || '#ef4444', isActive: offer.isActive,
            validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().slice(0, 16) : '',
            validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 16) : '',
            usageLimit: offer.usageLimit || ''
        });
        setEditingOffer(offer._id);
        setShowOfferForm(true);
    };

    const handleSaveOffer = async () => {
        if (!offerForm.title || !offerForm.code || !offerForm.discountValue) {
            toast.error('Title, Code and Discount Value are required');
            return;
        }
        try {
            const payload = { ...offerForm, discountValue: Number(offerForm.discountValue), minOrderAmount: Number(offerForm.minOrderAmount) || 0, maxDiscount: offerForm.maxDiscount ? Number(offerForm.maxDiscount) : null, usageLimit: offerForm.usageLimit ? Number(offerForm.usageLimit) : null };
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            if (editingOffer) {
                const offerId = String(editingOffer).trim();
                await axios.put(`/api/offers/admin/${offerId}`, payload, config);
                toast.success('Offer updated successfully');
            } else {
                await axios.post('/api/offers/admin', payload, config);
                toast.success('Offer created successfully');
            }
            resetOfferForm();
            fetchOffers();
        } catch (err) { 
            // console.error('Offer save error:', err);
            setError(err.response?.data?.message || 'Failed to save offer'); 
        }
    };

    const handleDeleteOffer = (id) => {
        const offer = offers.find(o => o._id === id);
        setDeleteModal({ 
            show: true, 
            type: 'offer', 
            id: id, 
            name: offer ? offer.title : 'this offer' 
        });
    };

    const handleToggleOffer = async (id) => {
        try {
            await axios.patch(`/api/offers/admin/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${userInfo.token}` } });
            fetchOffers();
        } catch (err) { console.error('Error toggling offer:', err); }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await axios.get(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setSelectedUser(response.data);
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const handleDeleteUser = (userId, userName) => {
        setDeleteModal({ show: true, type: 'user', id: userId, name: userName });
    };

    const handleDeleteDriver = (driver) => {
        setDeleteModal({ show: true, type: 'driver', id: driver._id, name: driver.name });
    };

    const confirmDelete = async () => {
        const { type, id, name } = deleteModal;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const cleanId = String(id).trim();

            if (type === 'user') {
                await axios.delete(`/api/admin/users/${cleanId}`, config);
                toast.success('User and all associated data deleted successfully');
                fetchDashboardData();
            } else if (type === 'menu') {
                await axios.delete(`/api/menu/${cleanId}`, config);
                toast.success(`"${name}" removed from menu successfully`);
                fetchMenuItems();
            } else if (type === 'offer') {
                await axios.delete(`/api/offers/admin/${cleanId}`, config);
                toast.success(`Offer "${name}" deleted successfully`);
                fetchOffers();
            } else if (type === 'driver') {
                await axios.delete(`/api/users/drivers/${cleanId}`, config);
                toast.success(`Driver "${name}" deleted successfully`);
                fetchDrivers();
            } else if (type === 'order') {
                await axios.delete(`/api/orders/${cleanId}`, config);
                toast.success(`Order #${name} deleted successfully`);
                setSelectedOrder(null);
                fetchOrders(ordersPage);
            }
            
            setDeleteModal({ show: false, type: '', id: null, name: '' });
        } catch (err) {
            console.error(`Error deleting ${type}:`, err);
            toast.error(err.response?.data?.message || `Failed to delete ${type}`);
            setDeleteModal({ show: false, type: '', id: null, name: '' });
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { data } = await axios.put(`/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setSelectedOrder(data); // Update modal content without closing
            fetchOrders(ordersPage); // Refresh the list in the background
            toast.success(`Order status updated to ${newStatus}`);
        } catch (err) {
            console.error('Error updating order status:', err);
            toast.error('Failed to update status');
        }
    };

    const handleAssignDriver = async (orderId, driverId) => {
        try {
            const { data } = await axios.put(`/api/admin/orders/${orderId}/assign-driver`,
                { driverId },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            // Update selected order with populated driver info
            const populatedOrder = await axios.get(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setSelectedOrder(populatedOrder.data);
            fetchOrders(ordersPage);
            toast.success(driverId ? 'Driver assigned successfully!' : 'Driver removed successfully!');
        } catch (err) {
            console.error('Error assigning driver:', err);
            toast.error('Failed to assign driver');
        }
    };

    const toggleUserExpansion = (userId) => {
        setExpandedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
        if (expandedUsers[userId]) {
            setExpandedOrderHistory(prev => ({
                ...prev,
                [userId]: false
            }));
        }
    };

    const toggleOrderHistoryExpansion = (userId, e) => {
        e.stopPropagation();
        setExpandedOrderHistory(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of customers section
        document.getElementById('customers-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            document.getElementById('customers-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            document.getElementById('customers-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const totalCartItems = users.reduce((sum, user) =>
        sum + (user.cart?.totalItems || 0), 0
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Placed': return '#3b82f6';
            case 'Preparing': return '#f59e0b';
            case 'Out for Delivery': return '#8b5cf6';
            case 'Delivered': return '#10b981';
            case 'Cancelled': return '#ef4444';
            default: return '#ffffff';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Placed': return <Clock size={isMobile ? 12 : 14} />;
            case 'Preparing': return <Coffee size={isMobile ? 12 : 14} />;
            case 'Out for Delivery': return <Truck size={isMobile ? 12 : 14} />;
            case 'Delivered': return <CheckCircle size={isMobile ? 12 : 14} />;
            case 'Cancelled': return <XCircle size={isMobile ? 12 : 14} />;
            default: return <Activity size={isMobile ? 12 : 14} />;
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Placed': { bg: '#3b82f620', color: '#3b82f6' },
            'Preparing': { bg: '#f59e0b20', color: '#f59e0b' },
            'Out for Delivery': { bg: '#8b5cf620', color: '#8b5cf6' },
            'Delivered': { bg: '#10b98120', color: '#10b981' },
            'Cancelled': { bg: '#ef444420', color: '#ef4444' }
        };
        const style = colors[status] || { bg: '#ffffff20', color: '#ffffff' };

        return (
            <span style={{
                background: style.bg,
                color: style.color,
                padding: isMobile ? '2px 6px' : '4px 8px',
                borderRadius: '12px',
                fontSize: isMobile ? '9px' : '11px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
            }}>
                {getStatusIcon(status)}
                {!isMobile ? status : status.substring(0, 3)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isMobile) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    if (!userInfo || !userInfo.isAdmin) return null;

    // Responsive styles
    const styles = {
        container: {
            maxWidth: '1600px',
            margin: '0 auto',
            padding: isMobile ? '70px 10px 20px' : isTablet ? '80px 15px 30px' : '100px 20px 40px',
            minHeight: '80vh'
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '20px' : isTablet ? '30px' : '40px',
            gap: '15px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: isMobile ? '10px' : '20px',
            marginBottom: isMobile ? '20px' : '30px'
        },
        statCard: {
            padding: isMobile ? '12px' : '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
        },
        statIcon: {
            padding: isMobile ? '10px' : '15px',
            borderRadius: '15px',
            width: 'fit-content',
            marginBottom: isMobile ? '8px' : '15px'
        },
        statValue: {
            fontSize: isMobile ? '18px' : isTablet ? '24px' : '28px',
            fontWeight: '800'
        },
        mainCard: {
            padding: isMobile ? '15px' : isTablet ? '20px' : '30px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
        },
        userCard: {
            padding: isMobile ? '12px' : '20px',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        userAvatar: {
            width: isMobile ? '40px' : '50px',
            height: isMobile ? '40px' : '50px',
            borderRadius: isMobile ? '20px' : '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: '600'
        },
        userName: {
            fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px',
            fontWeight: '600',
            marginBottom: '5px'
        },
        userInfo: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '5px' : '20px',
            color: '#888',
            fontSize: isMobile ? '11px' : '13px',
            flexWrap: 'wrap'
        },
        statsRow: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: isMobile ? '8px' : '15px',
            marginBottom: '20px'
        },
        statBox: {
            padding: isMobile ? '10px' : '15px',
            borderRadius: '12px',
            textAlign: 'center'
        },
        orderItem: {
            padding: isMobile ? '10px' : '15px',
            borderRadius: '12px',
            cursor: 'pointer'
        },
        modalContent: {
            maxWidth: isMobile ? '95%' : isTablet ? '90%' : '800px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            padding: isMobile ? '15px' : isTablet ? '20px' : '30px',
            borderRadius: '20px',
            position: 'relative'
        },
        searchBox: {
            background: 'rgba(255,255,255,0.05)',
            padding: isMobile ? '6px 12px' : '8px 15px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: isMobile ? '100%' : '300px'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '5px' : '10px',
            marginTop: '25px',
            flexWrap: 'wrap'
        },
        pageButton: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            padding: isMobile ? '6px 10px' : '8px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '11px' : '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            minWidth: isMobile ? '30px' : '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        activePageButton: {
            background: '#ef4444',
            border: '1px solid #ef4444',
            color: 'white'
        }
    };

    return (
        <div style={styles.container}>
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        position: 'fixed',
                        top: '15px',
                        right: '15px',
                        zIndex: 100,
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Header */}
            <div style={styles.header}>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: isMobile ? '22px' : isMobile ? '24px' : 'clamp(28px, 4vw, 42px)', fontWeight: '900', color: '#ef4444' }}
                >
                    Admin <span style={{ color: 'white' }}>Dashboard</span>
                </motion.h1>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: isMobile ? '6px 12px' : '10px 20px',
                        borderRadius: '30px',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '11px' : '14px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer'
                    }}
                    onClick={async () => {
                        try {
                            const registration = await navigator.serviceWorker.ready;
                            const token = await requestForToken(registration);
                            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                            await axios.post('/api/users/test-notification', { token }, config);
                            toast.success('Test request sent! Browser notification should appear soon. 🚀');
                        } catch (err) {
                            console.error('Test notification error:', err);
                            const errorMsg = err.response?.data?.details || err.response?.data?.message || 'Failed to send test push';
                            toast.error(errorMsg, { duration: 5000 });
                            if (err.response?.data?.troubleshooting) {
                                toast(err.response.data.troubleshooting, { icon: '💡', duration: 7000 });
                            }
                        }
                    }}>
                        {isMobile ? 'Test' : 'Test Notification 🔔'}
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ef4444',
                            padding: isMobile ? '6px 12px' : '10px 20px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: isMobile ? '11px' : '14px',
                            fontWeight: '600'
                        }}
                    >
                        <LogOut size={isMobile ? 14 : 16} />
                        {(!isMobile || window.innerWidth > 400) && 'Logout'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: isMobile ? '10px' : '15px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: isMobile ? '12px' : '14px'
                }}>
                    <AlertCircle size={isMobile ? 16 : 20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <div style={{
                        width: isMobile ? '30px' : '50px',
                        height: isMobile ? '30px' : '50px',
                        border: '3px solid rgba(239, 68, 68, 0.3)',
                        borderTopColor: '#ef4444',
                        borderRadius: '50%',
                        margin: '0 auto 15px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: '#888', fontSize: isMobile ? '12px' : '14px' }}>Loading dashboard data...</p>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div style={styles.statsGrid}>
                        <motion.div className="glass" style={styles.statCard}>
                            <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <TrendingUp size={isMobile ? 18 : 24} />
                            </div>
                            <p style={{ color: '#888', fontSize: isMobile ? '11px' : '13px', marginBottom: '5px' }}>Total Revenue</p>
                            <h3 style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</h3>
                        </motion.div>

                        <motion.div className="glass" style={styles.statCard}>
                            <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <Package size={isMobile ? 18 : 24} />
                            </div>
                            <p style={{ color: '#888', fontSize: isMobile ? '11px' : '13px', marginBottom: '5px' }}>Total Orders</p>
                            <h3 style={styles.statValue}>{stats.totalOrders}</h3>
                        </motion.div>

                        <motion.div className="glass" style={styles.statCard}>
                            <div style={{ ...styles.statIcon, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                                <Users size={isMobile ? 18 : 24} />
                            </div>
                            <p style={{ color: '#888', fontSize: isMobile ? '11px' : '13px', marginBottom: '5px' }}>Total Users</p>
                            <h3 style={styles.statValue}>{stats.totalUsers}</h3>
                        </motion.div>

                        <motion.div className="glass" style={styles.statCard}>
                            <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <ShoppingCart size={isMobile ? 18 : 24} />
                            </div>
                            <p style={{ color: '#888', fontSize: isMobile ? '11px' : '13px', marginBottom: '5px' }}>Active Carts</p>
                            <h3 style={styles.statValue}>{stats.activeCarts}</h3>
                        </motion.div>
                    </div>

                    {/* Tab Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        overflowX: 'auto',
                        paddingBottom: '15px',
                        marginBottom: '30px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: <Activity size={18} /> },
                            { id: 'orders', label: 'Orders', icon: <Package size={18} /> },
                            { id: 'menu', label: 'Menu', icon: <Menu size={18} /> },
                            { id: 'offers', label: 'Offers', icon: <Tag size={18} /> },
                            { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
                            { id: 'drivers', label: 'Drivers', icon: <Truck size={18} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: isMobile ? '8px 15px' : '10px 20px',
                                    borderRadius: '12px',
                                    background: activeTab === tab.id ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: activeTab === tab.id ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                    color: activeTab === tab.id ? '#ef4444' : '#888',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '12px' : '14px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'dashboard' && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div className="glass" style={{ ...styles.mainCard, background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <TrendingUp size={20} color="#10b981" /> Sales Performance
                                </h3>
                                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
                                    {[40, 60, 45, 90, 65, 80, 70].map((h, i) => (
                                        <div key={i} style={{ flex: 1, background: 'linear-gradient(to top, rgba(16, 185, 129, 0.1), #10b981)', height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#888', fontSize: '12px' }}>
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                            <div className="glass" style={{ ...styles.mainCard, background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Activity size={20} color="#f59e0b" /> Today's Snapshot
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        <p style={{ color: '#888', fontSize: '12px' }}>Orders Today</p>
                                        <h4 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.todayStats.orders}</h4>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        <p style={{ color: '#888', fontSize: '12px' }}>Revenue Today</p>
                                        <h4 style={{ fontSize: '24px', fontWeight: '800' }}>{formatCurrency(stats.todayStats.revenue)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'dashboard' || activeTab === 'orders') && (
                        <div className="glass" style={{ ...styles.mainCard, marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>Recent Orders</h2>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#888', fontSize: '13px' }}>
                                            <th style={{ padding: '12px' }}>ID</th>
                                            <th style={{ padding: '12px' }}>Customer</th>
                                            <th style={{ padding: '12px' }}>Total</th>
                                            <th style={{ padding: '12px' }}>Status</th>
                                            <th style={{ padding: '12px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '14px' }}>
                                                <td style={{ padding: '12px' }}>#{order._id.slice(-6)}</td>
                                                <td style={{ padding: '12px' }}>{order.user?.name}</td>
                                                <td style={{ padding: '12px' }}>{formatCurrency(order.totalPrice)}</td>
                                                <td style={{ padding: '12px' }}>{getStatusBadge(order.status)}</td>
                                                <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => setSelectedOrder(order)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}>
                                                        View Details
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteModal({ show: true, type: 'order', id: order._id, name: order._id?.slice(-8) || order.orderId })}
                                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Orders Pagination */}
                            {ordersPages > 1 && (
                                <div style={styles.pagination}>
                                    <button 
                                        onClick={() => fetchOrders(ordersPage - 1)}
                                        disabled={ordersPage === 1}
                                        style={{ ...styles.pageButton, opacity: ordersPage === 1 ? 0.5 : 1 }}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    {[...Array(ordersPages).keys()].map(x => (
                                        <button
                                            key={x + 1}
                                            onClick={() => fetchOrders(x + 1)}
                                            style={{
                                                ...styles.pageButton,
                                                ...(ordersPage === x + 1 ? styles.activePageButton : {})
                                            }}
                                        >
                                            {x + 1}
                                        </button>
                                    ))}

                                    <button 
                                        onClick={() => fetchOrders(ordersPage + 1)}
                                        disabled={ordersPage === ordersPages}
                                        style={{ ...styles.pageButton, opacity: ordersPage === ordersPages ? 0.5 : 1 }}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'offers') && (
                        <div className="glass" style={{
                        ...styles.mainCard,
                        marginBottom: '30px',
                        background: 'linear-gradient(145deg, #0A0A0F 0%, #1A1A24 100%)',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
                    }}>
                        {/* Animated red accent line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #DC2626, #EF4444, #7F1D1D, #DC2626)',
                            backgroundSize: '300% 100%',
                            animation: 'gradientMove 8s ease infinite',
                            borderRadius: '20px 20px 0 0'
                        }}></div>

                        {/* Header Section */}
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'stretch' : 'center',
                            marginBottom: '25px',
                            gap: '15px',
                            position: 'relative'
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: isMobile ? '20px' : isMobile ? '22px' : '26px',
                                    fontWeight: '800',
                                    marginBottom: '8px',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    textShadow: '0 2px 10px rgba(220, 38, 38, 0.3)'
                                }}>
                                    <Tag size={isMobile ? 22 : 26} style={{ color: '#DC2626' }} />
                                    <span style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #DC2626 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        Offers Management
                                    </span>
                                </h2>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? '5px' : '15px',
                                    alignItems: isMobile ? 'flex-start' : 'center'
                                }}>
                                    <p style={{ color: '#A0A0B0', fontSize: '14px', fontWeight: '500' }}>
                                        Total: <span style={{ color: '#DC2626', fontWeight: '700' }}>{offers.length}</span> offers
                                    </p>
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        background: '#DC2626',
                                        borderRadius: '50%',
                                        display: isMobile ? 'none' : 'block'
                                    }}></div>
                                    <p style={{ color: '#A0A0B0', fontSize: '14px', fontWeight: '500' }}>
                                        Active: <span style={{ color: '#22C55E', fontWeight: '700' }}>{offers.filter(o => o.isActive).length}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => { resetOfferForm(); setShowOfferForm(true); }}
                                style={{
                                    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: isMobile ? '10px 20px' : '12px 24px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
                                    transition: 'all 0.3s ease',
                                    width: isMobile ? '100%' : 'auto',
                                    letterSpacing: '0.5px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 25px rgba(220, 38, 38, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.3)';
                                }}
                            >
                                <Plus size={isMobile ? 16 : 18} />
                                Create New Offer
                            </button>
                        </div>

                        {/* Offer Form Modal */}
       <AnimatePresence>
    {showOfferForm && (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="offer-form-container"
        >
            <div className="offer-form-card">
                <h3 className="offer-form-title">
                    <span className="offer-form-title-bar"></span>
                    {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h3>

                <div className="offer-form-grid">
                    {/* Offer Title */}
                    <input
                        placeholder="Offer Title *"
                        value={offerForm.title}
                        onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                        className="offer-input offer-input-full"
                        onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                    />

                    {/* Coupon Code */}
                    <input
                        placeholder="Coupon Code *"
                        value={offerForm.code}
                        onChange={e => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                        className="offer-input offer-input-full offer-input-code"
                        onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                    />

                    {/* Description */}
                    <input
                        placeholder="Description *"
                        value={offerForm.description}
                        onChange={e => setOfferForm({ ...offerForm, description: e.target.value })}
                        className="offer-input offer-input-full"
                        onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                    />

                    {/* Discount Type and Value */}
                    <div className="offer-row">
                        <select
                            value={offerForm.discountType}
                            onChange={e => setOfferForm({ ...offerForm, discountType: e.target.value })}
                            className="offer-select"
                        >
                            <option value="percentage">Percentage %</option>
                            <option value="flat">Flat ₹</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Value *"
                            value={offerForm.discountValue}
                            onChange={e => setOfferForm({ ...offerForm, discountValue: e.target.value })}
                            className="offer-input offer-input-value"
                            onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                        />
                    </div>

                    {/* Min Order Amount */}
                    <input
                        type="number"
                        placeholder="Min Order Amount"
                        value={offerForm.minOrderAmount}
                        onChange={e => setOfferForm({ ...offerForm, minOrderAmount: e.target.value })}
                        className="offer-input offer-input-full"
                        onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                    />

                    {/* Max Discount */}
                    <input
                        type="number"
                        placeholder="Max Discount"
                        value={offerForm.maxDiscount}
                        onChange={e => setOfferForm({ ...offerForm, maxDiscount: e.target.value })}
                        className="offer-input offer-input-full"
                        onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                    />

                    {/* Usage Limit */}
                    <input
                        type="number"
                        placeholder="Usage Limit"
                        value={offerForm.usageLimit}
                        onChange={e => setOfferForm({ ...offerForm, usageLimit: e.target.value })}
                        className="offer-input offer-input-full"
                        onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'}
                    />

                    {/* Valid From */}
                    <div className="offer-datetime-container">
                        <label className="offer-datetime-label">From:</label>
                        <input
                            type="datetime-local"
                            value={offerForm.validFrom}
                            onChange={e => setOfferForm({ ...offerForm, validFrom: e.target.value })}
                            className="offer-datetime-input"
                        />
                    </div>

                    {/* Valid Until */}
                    <div className="offer-datetime-container offer-datetime-until">
                        <label className="offer-datetime-label offer-datetime-until-label">Until *:</label>
                        <input
                            type="datetime-local"
                            value={offerForm.validUntil}
                            onChange={e => setOfferForm({ ...offerForm, validUntil: e.target.value })}
                            className="offer-datetime-input"
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="offer-color-container">
                        <label className="offer-color-label">Color:</label>
                        <input
                            type="color"
                            value={offerForm.color}
                            onChange={e => setOfferForm({ ...offerForm, color: e.target.value })}
                            className="offer-color-input"
                        />
                        <span className="offer-color-value">{offerForm.color}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="offer-actions">
                    <button
                        onClick={resetOfferForm}
                        className="offer-button offer-button-cancel"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#A0A0B0';
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSaveOffer}
                        className="offer-button offer-button-save"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                        }}
                    >
                        {editingOffer ? 'Update Offer' : 'Create Offer'}
                    </button>
                </div>
            </div>
        </motion.div>
    )}
</AnimatePresence>

<style jsx="true">{`
    /* Offer Form Container */
    .offer-form-container {
        overflow: hidden;
        margin-bottom: 25px;
        width: 100%;
    }

    /* Offer Form Card */
    .offer-form-card {
        background: linear-gradient(145deg, #12121A 0%, #1E1E2A 100%);
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: 16px;
        padding: 15px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    /* Title Styles */
    .offer-form-title {
        font-size: clamp(16px, 4vw, 18px);
        font-weight: 700;
        margin-bottom: 16px;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .offer-form-title-bar {
        width: 4px;
        height: 20px;
        background: #DC2626;
        border-radius: 2px;
        display: inline-block;
        flex-shrink: 0;
    }

    /* Form Grid */
    .offer-form-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }

    /* Input Base Styles */
    .offer-input {
        padding: 12px 12px;
        background: #0A0A0F;
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: 10px;
        color: white;
        font-size: clamp(13px, 3.5vw, 14px);
        outline: none;
        transition: all 0.3s ease;
        width: 100%;
        box-sizing: border-box;
        -webkit-appearance: none;
        -moz-appearance: textfield;
    }

    .offer-input-full {
        width: 100%;
    }

    .offer-input-code {
        color: #DC2626;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    .offer-input-value {
        color: #DC2626;
        font-weight: 700;
    }

    /* Row Layout for Discount */
    .offer-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
        width: 100%;
    }

    /* Select Styles */
    .offer-select {
        flex: 1;
        padding: 12px;
        background: #0A0A0F;
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: 10px;
        color: white;
        font-size: clamp(13px, 3.5vw, 14px);
        outline: none;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
    }

    .offer-select option {
        background: #0A0A0F;
    }

    /* Datetime Container */
    .offer-datetime-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        background: #0A0A0F;
        padding: 6px 10px;
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: 10px;
        width: 100%;
        box-sizing: border-box;
        flex-wrap: wrap;
    }

    .offer-datetime-until {
        border-color: #DC2626;
    }

    .offer-datetime-label {
        font-size: clamp(12px, 3vw, 13px);
        color: #A0A0B0;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .offer-datetime-until-label {
        color: #DC2626;
        font-weight: 600;
    }

    .offer-datetime-input {
        flex: 1;
        min-width: 140px;
        padding: 8px 0;
        background: transparent;
        border: none;
        color: white;
        font-size: clamp(12px, 3vw, 13px);
        outline: none;
        width: 100%;
        box-sizing: border-box;
    }

    /* Color Picker Container */
    .offer-color-container {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #0A0A0F;
        padding: 8px 12px;
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: 10px;
        width: 100%;
        box-sizing: border-box;
        flex-wrap: wrap;
    }

    .offer-color-label {
        font-size: 13px;
        color: #A0A0B0;
        flex-shrink: 0;
    }

    .offer-color-input {
        width: 100%;
        max-width: 60px;
        height: 35px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: transparent;
    }

    .offer-color-value {
        color: #A0A0B0;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
    }

    /* Action Buttons Container */
    .offer-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        width: 100%;
    }

    /* Button Base Styles */
    .offer-button {
        padding: 14px 18px;
        border-radius: 10px;
        cursor: pointer;
        font-size: clamp(14px, 3.5vw, 15px);
        font-weight: 500;
        transition: all 0.3s ease;
        width: 100%;
        text-align: center;
        -webkit-tap-highlight-color: transparent;
        box-sizing: border-box;
    }

    .offer-button-cancel {
        background: transparent;
        border: 1px solid rgba(220, 38, 38, 0.3);
        color: #A0A0B0;
    }

    .offer-button-save {
        background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
        border: none;
        color: #ffffff;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    /* Focus States */
    .offer-input:focus,
    .offer-select:focus {
        border-color: #DC2626;
        outline: none;
    }

    /* Remove spinner from number inputs */
    .offer-input[type=number]::-webkit-inner-spin-button,
    .offer-input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .offer-input[type=number] {
        -moz-appearance: textfield;
    }

    /* Media Queries for very small devices */
    @media (max-width: 359px) {
        .offer-row {
            flex-direction: column;
        }
        
        .offer-select,
        .offer-input-value {
            width: 100%;
        }
        
        .offer-datetime-input {
            min-width: 120px;
        }
    }

    @media (max-width: 319px) {
        .offer-form-card {
            padding: 10px;
        }
        
        .offer-input,
        .offer-select,
        .offer-button {
            padding: 10px 10px;
            font-size: 12px;
        }
        
        .offer-datetime-container {
            padding: 4px 8px;
        }
        
        .offer-datetime-input {
            min-width: 100px;
            font-size: 11px;
        }
        
        .offer-color-container {
            padding: 6px 8px;
        }
        
        .offer-color-input {
            max-width: 45px;
            height: 30px;
        }
        
        .offer-color-value {
            font-size: 11px;
        }
    }

    /* Ensure minimum width support */
    @media (max-width: 280px) {
        .offer-form-card {
            padding: 8px;
        }
        
        .offer-datetime-container {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .offer-datetime-input {
            width: 100%;
            min-width: 100%;
        }
        
        .offer-color-container {
            flex-wrap: wrap;
        }
        
        .offer-color-input {
            max-width: 100%;
            width: 100%;
        }
    }
`}</style>
                        {/* Offers List */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', 
                            gap: '15px' 
                        }}>
                            {offers.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: isMobile ? '40px 20px' : '60px 20px',
                                    color: '#A0A0B0',
                                    background: 'rgba(220, 38, 38, 0.02)',
                                    borderRadius: '16px',
                                    border: '1px dashed rgba(220, 38, 38, 0.2)'
                                }}>
                                    <Tag size={isMobile ? 40 : 50} style={{ color: '#DC2626', opacity: 0.3, marginBottom: '15px' }} />
                                    <p style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>No offers yet. Create your first offer!</p>
                                </div>
                            ) : (
                                offers.map((offer) => (
                                    <motion.div
                                        key={offer._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            padding: isMobile ? '14px' : '18px',
                                            borderRadius: '14px',
                                            background: `linear-gradient(145deg, ${offer.isActive ? 'rgba(20,20,30,0.9)' : '#0F0F15'}, #0A0A0F)`,
                                            border: `1px solid ${offer.isActive ? offer.color : 'rgba(220, 38, 38, 0.1)'}`,
                                            boxShadow: offer.isActive ? `0 8px 20px ${offer.color}20` : 'none',
                                            opacity: offer.isActive ? 1 : 0.6,
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        whileHover={{ scale: 1.02, boxShadow: `0 12px 30px ${offer.color}30` }}
                                    >
                                        {/* Red accent line for active offers */}
                                        {offer.isActive && (
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                background: `linear-gradient(180deg, ${offer.color}, #DC2626)`,
                                                borderRadius: '4px 0 0 4px'
                                            }}></div>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            justifyContent: 'space-between',
                                            alignItems: isMobile ? 'stretch' : 'center',
                                            gap: isMobile ? '10px' : '15px',
                                            marginLeft: offer.isActive && !isMobile ? '12px' : '0'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '8px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        color: '#ffffff'
                                                    }}>
                                                        {offer.title}
                                                    </span>

                                                    <span style={{
                                                        background: offer.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.15)',
                                                        color: offer.isActive ? '#22C55E' : '#DC2626',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        letterSpacing: '0.3px'
                                                    }}>
                                                        {offer.isActive ? '● ACTIVE' : '○ INACTIVE'}
                                                    </span>

                                                    <span style={{
                                                        background: `${offer.color}20`,
                                                        color: offer.color,
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                                                    </span>
                                                </div>

                                                <div style={{
                                                    fontSize: isMobile ? '11px' : '12px',
                                                    color: '#A0A0B0',
                                                    display: 'flex',
                                                    gap: isMobile ? '8px' : '16px',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        background: 'rgba(220,38,38,0.1)',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        color: '#DC2626'
                                                    }}>
                                                        {offer.code}
                                                    </span>

                                                    {offer.minOrderAmount > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Min: ₹{offer.minOrderAmount}</span>
                                                        </>
                                                    )}

                                                    <span>•</span>
                                                    <span>Used: <span style={{ color: '#ffffff', fontWeight: '600' }}>{offer.usedCount || 0}</span>{offer.usageLimit ? `/${offer.usageLimit}` : ''}</span>

                                                    <span>•</span>
                                                    <span>Until: <span style={{ color: '#ffffff' }}>{new Date(offer.validUntil).toLocaleDateString()}</span></span>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                justifyContent: isMobile ? 'flex-end' : 'flex-start',
                                                marginTop: isMobile ? '10px' : '0'
                                            }}>
                                                <button
                                                    onClick={() => handleToggleOffer(offer._id)}
                                                    title={offer.isActive ? 'Deactivate' : 'Activate'}
                                                    style={{
                                                        background: offer.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                                                        border: `1px solid ${offer.isActive ? '#22C55E40' : '#DC262640'}`,
                                                        color: offer.isActive ? '#22C55E' : '#DC2626',
                                                        padding: '8px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    {offer.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                </button>

                                                <button
                                                    onClick={() => handleEditOffer(offer)}
                                                    style={{
                                                        background: 'rgba(59,130,246,0.1)',
                                                        border: '1px solid #3B82F640',
                                                        color: '#3B82F6',
                                                        padding: '8px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteOffer(offer._id)}
                                                    style={{
                                                        background: 'rgba(220,38,38,0.1)',
                                                        border: '1px solid #DC262640',
                                                        color: '#DC2626',
                                                        padding: '8px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                        e.currentTarget.style.background = 'rgba(220,38,38,0.2)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                    {activeTab === 'menu' && (
                        <div className="glass" style={{
                        ...styles.mainCard,
                        marginBottom: '30px',
                        background: 'linear-gradient(145deg, #0A0A0F 0%, #1A1A24 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
                        position: 'relative'
                    }}>
                        {/* Animated blue accent line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #3B82F6, #60A5FA, #1E40AF, #3B82F6)',
                            backgroundSize: '300% 100%',
                            animation: 'gradientMove 8s ease infinite',
                            borderRadius: '20px 20px 0 0'
                        }}></div>

                        {/* Header Section */}
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'stretch' : 'center',
                            marginBottom: '25px',
                            gap: '15px',
                            position: 'relative'
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: isMobile ? '20px' : isMobile ? '22px' : '26px',
                                    fontWeight: '800',
                                    marginBottom: '8px',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <Coffee size={isMobile ? 22 : 26} style={{ color: '#3B82F6' }} />
                                    <span style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #3B82F6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        Menu Management
                                    </span>
                                </h2>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? '5px' : '15px',
                                    alignItems: isMobile ? 'flex-start' : 'center'
                                }}>
                                    <p style={{ color: '#A0A0B0', fontSize: '14px', fontWeight: '500' }}>
                                        Total: <span style={{ color: '#3B82F6', fontWeight: '700' }}>{menuItems.length}</span> items
                                    </p>
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        background: '#3B82F6',
                                        borderRadius: '50%',
                                        display: isMobile ? 'none' : 'block'
                                    }}></div>
                                    <p style={{ color: '#A0A0B0', fontSize: '14px', fontWeight: '500' }}>
                                        Categories: <span style={{ color: '#3B82F6', fontWeight: '700' }}>5</span>
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                                <div style={{ ...styles.searchBox, width: isMobile ? '100%' : '250px' }}>
                                    <Search size={16} color="#888" />
                                    <input
                                        placeholder="Search menu..."
                                        value={menuSearchTerm}
                                        onChange={e => setMenuSearchTerm(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                                    />
                                </div>
                                <button
                                    onClick={() => { resetMenuForm(); setShowMenuForm(true); }}
                                    style={{
                                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                        border: 'none',
                                        color: '#ffffff',
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    <Plus size={18} />
                                    Add Food Item
                                </button>
                            </div>
                        </div>

                        {/* Menu Form */}
                        <AnimatePresence>
                            {showMenuForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '25px' }}
                                >
                                    <div style={{
                                        background: 'linear-gradient(145deg, #12121A 0%, #1E1E2A 100%)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '16px',
                                        padding: '24px'
                                    }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#ffffff' }}>
                                            {editingMenuItem ? 'Edit Food Item' : 'Add New Food Item'}
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                                            gap: '15px'
                                        }}>
                                            <input
                                                placeholder="Food Name"
                                                value={menuForm.name}
                                                onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                                                style={{ padding: '12px', background: '#0A0A0F', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: 'white' }}
                                            />
                                            <select
                                                value={menuForm.category}
                                                onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                                                required
                                                style={{ padding: '12px', background: '#0A0A0F', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: 'white', outline: 'none' }}
                                            >
                                                <option value="" disabled>Select Category</option>
                                                <option value="Starters">Starters</option>
                                                <option value="Main Course">Main Course</option>
                                                <option value="Chinese">Chinese</option>
                                                <option value="Beverages">Beverages</option>
                                                <option value="Desserts">Desserts</option>
                                            </select>
                                            <input
                                                placeholder="Price"
                                                type="number"
                                                value={menuForm.price}
                                                onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                                                style={{ padding: '12px', background: '#0A0A0F', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: 'white' }}
                                            />
                                            <input
                                                placeholder="Image URL"
                                                value={menuForm.img}
                                                onChange={e => setMenuForm({ ...menuForm, img: e.target.value })}
                                                style={{ padding: '12px', background: '#0A0A0F', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: 'white' }}
                                            />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                                                <label>Vegetarian:</label>
                                                <button
                                                    onClick={() => setMenuForm({ ...menuForm, isVeg: !menuForm.isVeg })}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: menuForm.isVeg ? '#10b981' : '#ef4444' }}
                                                >
                                                    {menuForm.isVeg ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                            <button
                                                onClick={handleSaveMenuItem}
                                                style={{ flex: 1, padding: '12px', background: '#3B82F6', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Save Item
                                            </button>
                                            <button
                                                onClick={resetMenuForm}
                                                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Menu Items List */}
                        <div style={{
                            maxHeight: isMobile ? '600px' : '800px',
                            overflowY: 'auto',
                            paddingRight: '5px'
                        }}>
                            {menuItems.filter(item =>
                                item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
                                item.category.toLowerCase().includes(menuSearchTerm.toLowerCase())
                            ).length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No food items found</p>
                            ) : (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)', 
                                    gap: isMobile ? '10px' : '15px' 
                                }}>
                                    {menuItems.filter(item =>
                                        item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
                                        item.category.toLowerCase().includes(menuSearchTerm.toLowerCase())
                                    ).map(item => (
                                        <div key={item._id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: isMobile ? '10px' : '15px',
                                            padding: isMobile ? '10px' : '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            position: 'relative'
                                        }}>
                                            <img src={item.img} alt={item.name} style={{ width: isMobile ? '50px' : '65px', height: isMobile ? '50px' : '65px', borderRadius: '10px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ color: 'white', fontSize: isMobile ? '13px' : '15px', marginBottom: '2px', fontWeight: '600' }}>{item.name}</h4>
                                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2px' : '10px', fontSize: '12px', color: '#888' }}>
                                                    <span>{item.category}</span>
                                                    <span>₹{item.price}</span>
                                                    <span style={{ color: item.isVeg ? '#10b981' : '#ef4444' }}>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                flexDirection: isMobile ? 'column' : 'row', 
                                                gap: isMobile ? '5px' : '8px',
                                                alignItems: 'center'
                                            }}>
                                                <button
                                                    onClick={() => handleToggleAvailability(item._id)}
                                                    style={{ 
                                                        background: 'transparent', 
                                                        border: 'none', 
                                                        cursor: 'pointer', 
                                                        color: item.isAvailable !== false ? '#10b981' : '#ef4444',
                                                        padding: '0'
                                                    }}
                                                    title={item.isAvailable !== false ? 'Mark as Unavailable' : 'Mark as Available'}
                                                >
                                                    {item.isAvailable !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                </button>
                                                <button
                                                    onClick={() => handleEditMenuItem(item)}
                                                    style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3B82F6', padding: isMobile ? '5px' : '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                >
                                                    <Edit size={isMobile ? 14 : 16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(item)}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: isMobile ? '5px' : '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={isMobile ? 14 : 16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                    {activeTab === 'customers' && (
                        <>
                        <div id="customers-section" className="glass" style={styles.mainCard}>
                        {/* Header with Search */}
                        <div style={{
                            display: 'flex',
                            flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: window.innerWidth < 600 ? 'flex-start' : 'center',
                            marginBottom: '20px',
                            gap: '15px'
                        }}>
                            <div>
                                <h2 style={{ fontSize: window.innerWidth < 400 ? '18px' : window.innerWidth < 600 ? '20px' : '24px', fontWeight: '700', marginBottom: '5px', color: '#ef4444' }}>
                                    All Customers
                                </h2>
                                <p style={{ color: '#888', fontSize: window.innerWidth < 400 ? '11px' : '13px' }}>
                                    Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} customers • {totalCartItems} items • {stats.totalOrders} orders
                                </p>
                            </div>

                            <div style={styles.searchBox}>
                                <Search size={window.innerWidth < 400 ? 14 : 16} color="#888" />
                                <input
                                    type="text"
                                    placeholder={window.innerWidth < 400 ? "Search..." : "Search customers..."}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset to first page when searching
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: window.innerWidth < 400 ? '12px' : '14px',
                                        outline: 'none',
                                        width: '100%'
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#888',
                                            cursor: 'pointer',
                                            padding: '0 5px'
                                        }}
                                    >
                                        <X size={window.innerWidth < 400 ? 12 : 14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {currentUsers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <Users size={36} style={{ margin: '0 auto 15px', opacity: 0.2 }} />
                                    <p style={{ fontSize: window.innerWidth < 400 ? '14px' : '16px', color: '#888' }}>
                                        No customers found
                                    </p>
                                </div>
                            ) : (
                                currentUsers.map((user, index) => (
                                    <motion.div
                                        key={user._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass"
                                        style={styles.userCard}
                                        onClick={() => toggleUserExpansion(user._id)}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            justifyContent: 'space-between',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                                <div style={{
                                                    ...styles.userAvatar,
                                                    background: user.isAdmin ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: user.isAdmin ? '#ef4444' : '#3b82f6'
                                                }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={styles.userName}>
                                                        {user.name}
                                                        {user.isAdmin && window.innerWidth > 400 && (
                                                            <span style={{
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                fontSize: '10px',
                                                                padding: '2px 6px',
                                                                borderRadius: '10px',
                                                                marginLeft: '8px'
                                                            }}>
                                                                ADMIN
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div style={styles.userInfo}>
                                                        <span>{window.innerWidth < 400 ? user.email.substring(0, 15) + '...' : user.email}</span>
                                                        <span style={{ color: '#3b82f6' }}>Orders: {user.orders?.count || user.orderCount || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button onClick={(e) => { e.stopPropagation(); fetchUserDetails(user._id); }} style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}>View Details</button>
                                                {!user.isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id, user.name); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredUsers.length > 0 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    style={{
                                        ...styles.pageButton,
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    <ChevronLeft size={window.innerWidth < 400 ? 14 : 16} />
                                    {window.innerWidth > 400 && ' Previous'}
                                </button>

                                <div style={{ display: 'flex', gap: window.innerWidth < 400 ? '3px' : '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                style={{
                                                    ...styles.pageButton,
                                                    ...(currentPage === pageNum ? styles.activePageButton : {})
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span style={{ color: '#888', padding: '0 5px' }}>...</span>
                                            <button
                                                onClick={() => paginate(totalPages)}
                                                style={{
                                                    ...styles.pageButton,
                                                    ...(currentPage === totalPages ? styles.activePageButton : {})
                                                }}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        ...styles.pageButton,
                                        opacity: currentPage === totalPages ? 0.5 : 1,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    {window.innerWidth > 400 && 'Next '}
                                    <ChevronRight size={window.innerWidth < 400 ? 14 : 16} />
                                </button>
                            </div>
                        )}

                        <div style={{
                            textAlign: 'center',
                            marginTop: '15px',
                            color: '#888',
                            fontSize: '12px'
                        }}>
                            Showing {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                        </div>
                    </div>
                        </>
                )}

                    {activeTab === 'drivers' && (
                        <>
             <div className="glass driver-management-card">
    <div className="driver-header">
        <div>
            <h2 className="driver-title">
                <Truck size={26} className="driver-title-icon" /> Driver Management
            </h2>
            <p className="driver-subtitle">Manage and monitor your delivery partners</p>
        </div>
        <button 
            onClick={() => {
                if (showDriverForm) resetDriverForm();
                else setShowDriverForm(true);
            }}
            className="driver-register-btn"
        >
            {showDriverForm ? <X size={18} /> : <Plus size={18} />}
            {showDriverForm ? 'Cancel' : 'Register New Driver'}
        </button>
    </div>

    <AnimatePresence>
        {showDriverForm && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="driver-form-container"
            >
                <form
                    onSubmit={handleSaveDriver}
                    className="driver-form"
                >
                    <div className="driver-form-group form-group-full">
                        <label className="driver-form-label">Driver Name</label>
                        <input
                            placeholder="Enter full name"
                            required
                            value={driverForm.name}
                            onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                            className="driver-form-input"
                        />
                    </div>
                    
                    <div className="driver-form-group form-group-full">
                        <label className="driver-form-label">Email Address</label>
                        <input
                            placeholder="Email for login"
                            type="email"
                            required
                            value={driverForm.email}
                            onChange={e => setDriverForm({ ...driverForm, email: e.target.value })}
                            className="driver-form-input"
                        />
                    </div>
                    
                    <div className="driver-form-group">
                        <label className="driver-form-label">Phone</label>
                        <input
                            placeholder="Contact"
                            required
                            value={driverForm.phone}
                            onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })}
                            className="driver-form-input"
                        />
                    </div>
                    
                    <div className="driver-form-group">
                        <label className="driver-form-label">{editingDriver ? 'New Password' : 'Password'}</label>
                        <input
                            placeholder={editingDriver ? "Leave blank to keep same" : "Set password"}
                            type="password"
                            required={!editingDriver}
                            value={driverForm.password}
                            onChange={e => setDriverForm({ ...driverForm, password: e.target.value })}
                            className="driver-form-input"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="driver-submit-btn"
                    >
                        {editingDriver ? 'Update Driver Profile' : 'Register Driver'}
                    </button>
                </form>
            </motion.div>
        )}
    </AnimatePresence>

    <div className="driver-grid">
        {drivers.length === 0 ? (
            <div className="driver-empty-state">
                <Truck size={48} className="driver-empty-icon" />
                <p className="driver-empty-text">No drivers registered yet</p>
            </div>
        ) : (
            drivers.map(driver => (
                <motion.div 
                    key={driver._id} 
                    whileHover={{ scale: 1.02 }}
                    className="driver-card"
                >
                    <div className="driver-card-header">
                        <div className={`driver-avatar ${driver.isAvailable ? 'available' : 'offline'}`}>
                            {driver.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="driver-info">
                            <h3 className="driver-name">{driver.name}</h3>
                            <div className="driver-status">
                                <div className={`status-dot ${driver.isAvailable ? 'status-online' : 'status-offline'}`} />
                                <span className={`status-text ${driver.isAvailable ? 'status-online' : 'status-offline'}`}>
                                    {driver.isAvailable ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="driver-contact">
                        <div className="driver-contact-item">
                            <Mail size={14} className="contact-icon" /> 
                            <span className="contact-text">{driver.email}</span>
                        </div>
                        <div className="driver-contact-item">
                            <Phone size={14} className="contact-icon" /> 
                            <span className="contact-text">{driver.phone || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="driver-actions">
                        <button 
                            onClick={() => handleEditDriver(driver)}
                            className="driver-edit-btn"
                        >
                            Edit Profile
                        </button>
                        <button 
                            onClick={() => handleDeleteDriver(driver)}
                            className="driver-delete-btn"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </motion.div>
            ))
        )}
    </div>
</div>

<style jsx="true">{`
    .driver-management-card {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding: clamp(15px, 4vw, 24px);
        background: linear-gradient(145deg, #12121A 0%, #1E1E2A 100%);
        border: 1px solid rgba(220, 38, 38, 0.2);
        border-radius: 16px;
    }

    /* Header Section */
    .driver-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        gap: 15px;
        flex-wrap: wrap;
    }

    .driver-title {
        font-size: clamp(20px, 5vw, 26px);
        font-weight: 800;
        color: #ef4444;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
    }

    .driver-title-icon {
        width: clamp(22px, 5vw, 26px);
        height: clamp(22px, 5vw, 26px);
    }

    .driver-subtitle {
        color: #888;
        font-size: clamp(12px, 3.5vw, 14px);
        margin: 5px 0 0 0;
    }

    .driver-register-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 700;
        box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
        width: auto;
        min-width: fit-content;
        padding: clamp(10px, 3vw, 12px) clamp(15px, 4vw, 24px);
        border-radius: 12px;
        border: none;
        color: white;
        cursor: pointer;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        font-size: clamp(13px, 3.5vw, 14px);
        transition: all 0.3s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .driver-register-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 20px rgba(239, 68, 68, 0.3);
    }

    .driver-register-btn:active {
        transform: translateY(0);
    }

    /* Form Container */
    .driver-form-container {
        overflow: hidden;
        width: 100%;
    }

    .driver-form {
        background: rgba(255,255,255,0.03);
        padding: clamp(15px, 4vw, 25px);
        border-radius: 20px;
        margin-bottom: 30px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: clamp(10px, 3vw, 15px);
        border: 1px solid rgba(255,255,255,0.05);
        width: 100%;
        box-sizing: border-box;
    }

    .driver-form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 100%;
    }

    .form-group-full {
        grid-column: span 2;
    }

    .driver-form-label {
        font-size: clamp(11px, 3vw, 12px);
        color: #888;
        margin-left: 5px;
    }

    .driver-form-input {
        padding: clamp(10px, 3vw, 12px) clamp(12px, 3.5vw, 16px);
        background: rgba(0,0,0,0.3);
        color: white;
        border: 1px solid #333;
        border-radius: 10px;
        outline: none;
        font-size: clamp(13px, 3.5vw, 14px);
        width: 100%;
        box-sizing: border-box;
        transition: all 0.3s ease;
    }

    .driver-form-input:focus {
        border-color: #ef4444;
    }

    .driver-submit-btn {
        grid-column: span 2;
        background: #ef4444;
        color: white;
        padding: clamp(10px, 3vw, 12px);
        border-radius: 10px;
        border: none;
        font-weight: 700;
        cursor: pointer;
        margin-top: 10px;
        font-size: clamp(14px, 4vw, 16px);
        transition: all 0.3s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .driver-submit-btn:hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
    }

    .driver-submit-btn:active {
        transform: translateY(0);
    }

    /* Drivers Grid */
    .driver-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        width: 100%;
    }

    /* Empty State */
    .driver-empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: clamp(40px, 10vw, 60px) 0;
        background: rgba(255,255,255,0.02);
        border-radius: 20px;
        border: 1px dashed #333;
        width: 100%;
    }

    .driver-empty-icon {
        opacity: 0.1;
        margin-bottom: 15px;
        width: 48px;
        height: 48px;
    }

    .driver-empty-text {
        color: #888;
        font-size: clamp(14px, 4vw, 16px);
    }

    /* Driver Card */
    .driver-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        padding: clamp(16px, 4vw, 24px);
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        position: relative;
        transition: all 0.3s ease;
        width: 100%;
        box-sizing: border-box;
    }

    .driver-card-header {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
    }

    .driver-avatar {
        width: clamp(48px, 12vw, 56px);
        height: clamp(48px, 12vw, 56px);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: clamp(18px, 5vw, 22px);
        font-weight: 800;
    }

    .driver-avatar.available {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .driver-avatar.offline {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }

    .driver-info {
        flex: 1;
        min-width: 0;
    }

    .driver-name {
        font-size: clamp(16px, 4.5vw, 18px);
        font-weight: 700;
        color: white;
        margin: 0 0 5px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .driver-status {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .status-dot.status-online {
        background: #10b981;
        box-shadow: 0 0 10px #10b981;
    }

    .status-dot.status-offline {
        background: #ef4444;
        box-shadow: 0 0 10px #ef4444;
    }

    .status-text {
        font-size: clamp(11px, 3vw, 12px);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-text.status-online {
        color: #10b981;
    }

    .status-text.status-offline {
        color: #ef4444;
    }

    /* Contact Info */
    .driver-contact {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: clamp(10px, 3vw, 12px);
        background: rgba(0,0,0,0.2);
        border-radius: 12px;
        width: 100%;
        box-sizing: border-box;
    }

    .driver-contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #888;
        font-size: clamp(12px, 3.5vw, 13px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .contact-icon {
        flex-shrink: 0;
    }

    .contact-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Action Buttons */
    .driver-actions {
        display: flex;
        gap: 10px;
        width: 100%;
    }

    .driver-edit-btn {
        flex: 1;
        padding: clamp(8px, 2.5vw, 10px);
        background: rgba(255,255,255,0.05);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: clamp(11px, 3vw, 12px);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .driver-edit-btn:hover {
        background: rgba(255,255,255,0.1);
    }

    .driver-delete-btn {
        padding: clamp(8px, 2.5vw, 10px);
        background: rgba(239, 68, 68, 0.1);
        border: none;
        border-radius: 10px;
        color: #ef4444;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-tap-highlight-color: transparent;
    }

    .driver-delete-btn:hover {
        background: rgba(239, 68, 68, 0.2);
    }

    /* Media Queries for different screen sizes */
    @media (max-width: 768px) {
        .driver-header {
            flex-direction: column;
            align-items: stretch;
        }

        .driver-register-btn {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .driver-form {
            grid-template-columns: 1fr;
        }

        .driver-form-group,
        .form-group-full,
        .driver-submit-btn {
            grid-column: span 1;
        }

        .driver-grid {
            grid-template-columns: 1fr;
        }

        .driver-card-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .driver-info {
            width: 100%;
            text-align: center;
        }

        .driver-status {
            justify-content: center;
        }
    }

    @media (max-width: 359px) {
        .driver-actions {
            flex-direction: column;
        }

        .driver-edit-btn,
        .driver-delete-btn {
            width: 100%;
        }

        .driver-contact-item {
            flex-wrap: wrap;
        }
    }

    @media (max-width: 280px) {
        .driver-form-input {
            font-size: 12px;
            padding: 8px 10px;
        }

        .driver-contact-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
        }

        .driver-card {
            padding: 12px;
        }

        .driver-avatar {
            width: 40px;
            height: 40px;
            font-size: 16px;
        }
`}</style>
                        </>
                    )}
                </>
            )}

            {/* Customer Details Modal */}
            <AnimatePresence>
                {selectedUser && (
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
                            background: 'rgba(0,0,0,0.95)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '10px'
                        }}
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass"
                            style={styles.modalContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedUser(null)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: 'white',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 10
                                }}
                            >
                                <X size={16} />
                            </button>

                            <h2 style={{ fontSize: window.innerWidth < 400 ? '20px' : '24px', fontWeight: '700', marginBottom: '15px', color: '#ef4444' }}>
                                Customer Profile
                            </h2>

                            {/* Customer Info */}
                            <div style={{
                                display: 'flex',
                                flexDirection: window.innerWidth < 400 ? 'column' : 'row',
                                gap: '15px',
                                marginBottom: '20px',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '15px',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: window.innerWidth < 400 ? '50px' : '60px',
                                    height: window.innerWidth < 400 ? '50px' : '60px',
                                    borderRadius: '30px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: window.innerWidth < 400 ? '20px' : '24px',
                                    fontWeight: '600',
                                    color: '#ef4444',
                                    margin: window.innerWidth < 400 ? '0 auto' : '0'
                                }}>
                                    {selectedUser.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: window.innerWidth < 400 ? '16px' : '18px', fontWeight: '600', marginBottom: '8px', textAlign: window.innerWidth < 400 ? 'center' : 'left' }}>
                                        {selectedUser.user?.name}
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: window.innerWidth < 400 ? '1fr' : 'repeat(2, 1fr)',
                                        gap: '8px',
                                        fontSize: window.innerWidth < 400 ? '11px' : '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Mail size={12} color="#888" />
                                            <span style={{ wordBreak: 'break-all' }}>{selectedUser.user?.email}</span>
                                        </div>
                                        {selectedUser.user?.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Phone size={12} color="#888" />
                                                <span>{selectedUser.user?.phone}</span>
                                            </div>
                                        )}
                                        {selectedUser.user?.address && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', gridColumn: window.innerWidth < 400 ? 'auto' : 'span 2' }}>
                                                <MapPin size={12} color="#888" />
                                                <span style={{ wordBreak: 'break-word' }}>
                                                    {selectedUser.user?.address}, {selectedUser.user?.city} {selectedUser.user?.zipCode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 400 ? '1fr' : 'repeat(3, 1fr)',
                                gap: '10px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ color: '#888', fontSize: '10px', marginBottom: '3px' }}>Orders</p>
                                    <p style={{ fontSize: window.innerWidth < 400 ? '20px' : '22px', fontWeight: '700', color: '#10b981' }}>
                                        {selectedUser.stats?.totalOrders || selectedUser.orders?.length || 0}
                                    </p>
                                </div>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ color: '#888', fontSize: '10px', marginBottom: '3px' }}>Spent</p>
                                    <p style={{ fontSize: window.innerWidth < 400 ? '18px' : '20px', fontWeight: '700', color: '#3b82f6' }}>
                                        {formatCurrency(selectedUser.stats?.totalSpent)}
                                    </p>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ color: '#888', fontSize: '10px', marginBottom: '3px' }}>Avg</p>
                                    <p style={{ fontSize: window.innerWidth < 400 ? '18px' : '20px', fontWeight: '700', color: '#f59e0b' }}>
                                        {formatCurrency(selectedUser.stats?.averageOrderValue)}
                                    </p>
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>
                                    Order History ({selectedUser.orders?.length || 0})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedUser.orders?.map((order, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                background: 'rgba(59, 130, 246, 0.03)',
                                                borderRadius: '10px',
                                                padding: '12px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setSelectedUser(null);
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontWeight: '600', fontSize: '12px' }}>#{order.orderId || order._id?.slice(-6)}</span>
                                                {getStatusBadge(order.status)}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                                                <span style={{ color: '#888' }}>{formatDate(order.createdAt)}</span>
                                                <span style={{ color: '#10b981', fontWeight: '600' }}>{formatCurrency(order.totalPrice)}</span>
                                            </div>

                                            <div style={{ fontSize: '10px', color: '#888' }}>
                                                {(order.items || order.orderItems)?.length || 0} items •
                                                {order.isPaid ? ' Paid' : ' Pending'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            background: 'rgba(0,0,0,0.95)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '10px'
                        }}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass"
                            style={{
                                maxWidth: '500px',
                                width: '100%',
                                maxHeight: '85vh',
                                overflow: 'auto',
                                padding: window.innerWidth < 400 ? '15px' : '20px',
                                borderRadius: '15px',
                                position: 'relative'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: 'white',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={16} />
                            </button>

                            <h2 style={{ fontSize: window.innerWidth < 400 ? '18px' : '20px', fontWeight: '700', marginBottom: '5px', color: '#ef4444' }}>
                                Order Details
                            </h2>
                            <p style={{ color: '#888', fontSize: '11px', marginBottom: '15px' }}>
                                #{selectedOrder._id?.slice(-8) || selectedOrder.orderId}
                            </p>

                            {/* Order Items */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '12px',
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>
                                    Items
                                </h3>
                                {(selectedOrder.items || selectedOrder.orderItems)?.map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '6px 0',
                                        borderBottom: idx < (selectedOrder.items?.length || selectedOrder.orderItems?.length) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        fontSize: '12px'
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: '500' }}>{item.name}</p>
                                            <p style={{ color: '#888', fontSize: '10px' }}>Qty: {item.qty || item.quantity}</p>
                                        </div>
                                        <p style={{ color: '#10b981' }}>
                                            {formatCurrency(item.price * (item.qty || item.quantity))}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '12px',
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>
                                    Summary
                                </h3>
                                <div style={{ fontSize: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: '#888' }}>Subtotal:</span>
                                        <span>{formatCurrency(selectedOrder.itemsPrice)}</span>
                                    </div>
                                    {selectedOrder.shippingPrice > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ color: '#888' }}>Shipping:</span>
                                            <span>{formatCurrency(selectedOrder.shippingPrice)}</span>
                                        </div>
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '8px',
                                        paddingTop: '8px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontWeight: '600'
                                    }}>
                                        <span>Total:</span>
                                        <span style={{ color: '#10b981' }}>{formatCurrency(selectedOrder.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '12px',
                                borderRadius: '10px'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>
                                    Status
                                </h3>
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    {['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(selectedOrder._id, status)}
                                            style={{
                                                background: selectedOrder.status === status ? getStatusColor(status) : 'rgba(255,255,255,0.05)',
                                                border: 'none',
                                                color: selectedOrder.status === status ? 'white' : getStatusColor(status),
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontSize: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}
                                        >
                                            {getStatusIcon(status)}
                                            {window.innerWidth < 400 ? status.substring(0, 3) : status}
                                        </button>
                                    ))}
                                </div>
                                <div style={{
                                    padding: '8px',
                                    background: selectedOrder.isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '11px'
                                }}>
                                    <span style={{ color: '#888' }}>Payment:</span>
                                    <span style={{ color: selectedOrder.isPaid ? '#10b981' : '#f59e0b' }}>
                                        {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Driver Assignment */}
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '10px'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Truck size={16} /> {selectedOrder.driver ? 'Assigned Driver' : 'Assign Driver'}
                                </h3>
                                
                                {selectedOrder.driver ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                                                {selectedOrder.driver.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '12px', fontWeight: '600' }}>{selectedOrder.driver.name}</p>
                                                <p style={{ fontSize: '10px', color: '#888' }}>{selectedOrder.driver.phone}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAssignDriver(selectedOrder._id, null)}
                                            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '10px' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select 
                                            onChange={(e) => handleAssignDriver(selectedOrder._id, e.target.value)}
                                            style={{ flex: 1, padding: '10px', background: '#0a0a0a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                                        >
                                            <option value="">Choose a driver...</option>
                                            {drivers.length === 0 ? (
                                                <option disabled>No drivers registered</option>
                                            ) : (
                                                drivers.map(driver => (
                                                    <option key={driver._id} value={driver._id}>
                                                        {driver.name} {driver.isAvailable ? '🟢 Online' : '⚪ Offline'}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Delete Order Button */}
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setDeleteModal({ show: true, type: 'order', id: selectedOrder._id, name: selectedOrder._id?.slice(-8) || selectedOrder.orderId })}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#ef4444',
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#ef4444';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        e.currentTarget.style.color = '#ef4444';
                                    }}
                                >
                                    <Trash2 size={16} /> Delete Order
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteModal.show && (
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
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            padding: '20px'
                        }}
                        onClick={() => setDeleteModal({ show: false, type: '', id: null, name: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="glass"
                            style={{
                                maxWidth: '400px',
                                width: '100%',
                                padding: '30px',
                                borderRadius: '24px',
                                textAlign: 'center',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '35px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#ef4444'
                            }}>
                                <AlertCircle size={40} />
                            </div>

                            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>
                                {deleteModal.type === 'user' ? 'Delete Customer?' : deleteModal.type === 'offer' ? 'Delete Offer?' : deleteModal.type === 'order' ? 'Delete Order?' : 'Delete Food Item?'}
                            </h3>
                            
                            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                                {deleteModal.type === 'user' ? (
                                    <>
                                        Are you sure you want to delete <span style={{ color: '#ef4444', fontWeight: '600' }}>"{deleteModal.name}"</span>? 
                                        This will permanently remove their profile, order history, and cart data.
                                    </>
                                ) : deleteModal.type === 'offer' ? (
                                    <>
                                        Are you sure you want to delete the offer <span style={{ color: '#ef4444', fontWeight: '600' }}>"{deleteModal.name}"</span>? 
                                        This promotion will be removed immediately.
                                    </>
                                ) : deleteModal.type === 'order' ? (
                                    <>
                                        Are you sure you want to delete order <span style={{ color: '#ef4444', fontWeight: '600' }}>#{deleteModal.name}</span>? 
                                        This action cannot be undone.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to remove <span style={{ color: '#ef4444', fontWeight: '600' }}>"{deleteModal.name}"</span> from the menu? 
                                        This action will permanently delete this item.
                                    </>
                                )}
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setDeleteModal({ show: false, type: '', id: null, name: '' })}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: '#ef4444',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    Delete Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 280px) {
                    .glass {
                        padding: 10px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;