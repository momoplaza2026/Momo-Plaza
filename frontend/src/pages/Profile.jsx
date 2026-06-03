import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, Package, Settings, 
    LogOut, ChevronRight, Save, Loader, Lock, 
    CreditCard, Bell, Shield, Camera, Heart, Clock, X, CheckCircle, Navigation as NavIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LocationPicker from '../components/LocationPicker';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo, login, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        password: '',
        confirmPassword: ''
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);

    // Define styles object BEFORE any JSX that uses it
    const styles = {
        loadingScreen: {
            minHeight: '100vh',
            background: '#07070a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
        },
        spinner: {
            width: '60px',
            height: '60px',
            border: '3px solid rgba(239, 68, 68, 0.1)',
            borderTopColor: '#ef4444',
            borderRadius: '50%',
        },
        loadingText: {
            color: '#888',
            letterSpacing: '2px',
            fontSize: '12px',
            fontWeight: 'bold',
        },
        page: {
            minHeight: '100vh',
            background: '#07070a',
            paddingTop: isMobile ? '80px' : '120px',
            paddingBottom: isMobile ? '60px' : '100px',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '0 12px' : '0 25px',
        },
        mobileMenuToggle: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            cursor: 'pointer',
        },
        mobileMenuText: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
        },
        mobileMenuIcon: {
            color: '#ef4444',
        },
        heroSection: {
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: isMobile ? '24px' : '40px',
            padding: isMobile ? '20px 16px' : '40px',
            marginBottom: isMobile ? '30px' : '60px',
            overflow: 'hidden',
        },
        heroGlow: {
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: isMobile ? '200px' : '400px',
            height: isMobile ? '200px' : '400px',
            background: 'rgba(239, 68, 68, 0.08)',
            filter: 'blur(100px)',
            borderRadius: '50%',
            zIndex: 0,
        },
        heroContent: {
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            gap: isMobile ? '20px' : '40px',
            justifyContent: isMobile ? 'center' : 'flex-start',
        },
        avatarWrapper: {
            position: 'relative',
        },
        avatar: {
            width: isMobile ? '80px' : '120px',
            height: isMobile ? '80px' : '120px',
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
            borderRadius: isMobile ? '24px' : '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '900',
            color: 'white',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.2)',
            transform: 'rotate(-5deg)',
        },
        avatarStatus: {
            position: 'absolute',
            bottom: isMobile ? '4px' : '8px',
            right: isMobile ? '4px' : '8px',
            width: isMobile ? '12px' : '16px',
            height: isMobile ? '12px' : '16px',
            background: '#22c55e',
            borderRadius: '50%',
            border: isMobile ? '2px solid #07070a' : '3px solid #07070a',
        },
        editAvatarBtn: {
            position: 'absolute',
            top: isMobile ? '-5px' : '-10px',
            right: isMobile ? '-5px' : '-10px',
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            background: '#222',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: isMobile ? '10px' : '12px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: 'rotate(5deg)',
        },
        heroInfo: {
            flex: 1,
            minWidth: isMobile ? '100%' : '250px',
        },
        userName: {
            fontSize: isMobile ? '28px' : '42px',
            fontWeight: '900',
            marginBottom: isMobile ? '8px' : '10px',
            letterSpacing: '-1.5px',
            background: 'linear-gradient(to right, #fff, #888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            wordBreak: 'break-word',
        },
        userMeta: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            gap: isMobile ? '10px' : '15px',
            color: '#888',
            fontSize: isMobile ? '13px' : '14px',
            flexWrap: 'wrap',
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        metaDivider: {
            opacity: 0.3,
            display: isMobile ? 'none' : 'block',
        },
        tierBadge: {
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: isMobile ? '3px 10px' : '4px 12px',
            borderRadius: '20px',
            fontSize: isMobile ? '10px' : '11px',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            border: '1px solid rgba(239, 68, 68, 0.2)',
        },
        statsContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '15px' : '30px',
            background: 'rgba(255,255,255,0.03)',
            padding: isMobile ? '12px 20px' : '20px 40px',
            borderRadius: isMobile ? '20px' : '30px',
            border: '1px solid rgba(255,255,255,0.05)',
            width: isMobile ? '100%' : 'auto',
            marginTop: isMobile ? '10px' : '0',
        },
        statBox: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        statVal: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '900',
            color: 'white',
        },
        statLabel: {
            fontSize: isMobile ? '10px' : '11px',
            color: '#555',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '4px',
        },
        statDivider: {
            width: '1px',
            height: isMobile ? '25px' : '30px',
            background: 'rgba(255,255,255,0.05)',
        },
        layout: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
            gap: isMobile ? '20px' : '40px',
        },
        sidebar: {
            position: isMobile ? 'fixed' : 'sticky',
            top: isMobile ? '0' : '120px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: isMobile ? (showMobileMenu ? 'block' : 'none') : 'block',
            background: isMobile ? '#07070a' : 'transparent',
            padding: isMobile ? '16px' : '0',
            height: isMobile ? '100vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible',
        },
        sidebarOverlay: {
            display: isMobile && showMobileMenu ? 'block' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 999,
        },
        navCard: {
            background: '#111',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: isMobile ? '28px' : '32px',
            padding: isMobile ? '20px' : '30px',
            height: isMobile ? 'calc(100vh - 32px)' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible',
            position: 'relative',
        },
        menuHeader: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        menuTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
        },
        closeBtn: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        sectionTitle: {
            fontSize: '11px',
            fontWeight: '800',
            color: '#444',
            letterSpacing: '2px',
            marginBottom: '20px',
            paddingLeft: '12px',
        },
        navLinks: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '24px',
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: isMobile ? '14px' : '16px',
            paddingBottom: isMobile ? '14px' : '16px',
            paddingRight: isMobile ? '16px' : '20px',
            paddingLeft: isMobile ? '16px' : '20px',
            borderRadius: '16px',
            border: 'none',
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            textAlign: 'left',
            width: '100%',
        },
        activeIndicator: {
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '70%',
            width: '3px',
            background: '#ef4444',
            borderRadius: '0 4px 4px 0',
        },
        navDivider: {
            height: '1px',
            background: 'rgba(255,255,255,0.05)',
            margin: '16px 0',
        },
        logoutBtn: {
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none',
            color: 'white',
            padding: isMobile ? '16px' : '18px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)',
            marginTop: '8px',
        },
        content: {
            minHeight: isMobile ? 'auto' : '600px',
        },
        contentCard: {
            background: '#111',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: isMobile ? '24px' : '40px',
            padding: isMobile ? '24px 16px' : '50px',
            minHeight: '100%',
        },
        tabContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '24px' : '40px',
        },
        tabHeader: {
            marginBottom: isMobile ? '5px' : '10px',
        },
        tabTitle: {
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '900',
            marginBottom: isMobile ? '8px' : '10px',
            letterSpacing: '-1px',
            lineHeight: 1.2,
        },
        tabSub: {
            color: '#555',
            fontSize: isMobile ? '14px' : '15px',
            lineHeight: 1.5,
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '16px' : '24px',
        },
        inputGroupFull: {
            gridColumn: isMobile ? '1' : '1 / span 2',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        inputGroup: {
            gridColumn: isMobile ? '1' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        label: {
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '700',
            color: '#666',
            letterSpacing: '0.5px',
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
        },
        inputIcon: {
            position: 'absolute',
            left: isMobile ? '16px' : '20px',
            color: '#444',
        },
        input: {
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: isMobile ? '14px' : '16px',
            padding: isMobile ? '14px 16px 14px 45px' : '16px 20px 16px 55px',
            color: 'white',
            fontSize: isMobile ? '14px' : '15px',
            outline: 'none',
            transition: 'all 0.3s',
        },
        inputNoIcon: {
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: isMobile ? '14px' : '16px',
            padding: isMobile ? '14px 16px' : '16px 20px',
            color: 'white',
            fontSize: isMobile ? '14px' : '15px',
            outline: 'none',
            transition: 'all 0.3s',
        },
        formSectionTitle: {
            gridColumn: isMobile ? '1' : '1 / span 2',
            marginTop: isMobile ? '10px' : '20px',
            paddingTop: isMobile ? '20px' : '30px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '800',
            color: '#444',
            letterSpacing: '1px',
            textTransform: 'uppercase',
        },
        actionWrapper: {
            marginTop: isMobile ? '16px' : '20px',
            display: 'flex',
            justifyContent: isMobile ? 'stretch' : 'flex-end',
        },
        saveBtn: {
            width: isMobile ? '100%' : 'auto',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            border: 'none',
            color: 'white',
            padding: isMobile ? '16px 24px' : '18px 40px',
            borderRadius: isMobile ? '14px' : '18px',
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)',
            transition: 'all 0.3s',
        },
        emptyState: {
            padding: isMobile ? '40px 16px' : '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
        },
        emptyIcon: {
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            background: 'rgba(239,68,68,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
        },
        emptyTitle: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '800',
            color: '#fff',
        },
        emptySub: {
            fontSize: isMobile ? '14px' : '15px',
            color: '#666',
            maxWidth: '400px',
            lineHeight: 1.6,
        },
        browseBtn: {
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            padding: isMobile ? '14px 28px' : '16px 32px',
            borderRadius: '14px',
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s',
        },
        ordersList: {
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px',
        },
        orderCard: {
            background: 'rgba(255,255,255,0.02)',
            borderRadius: isMobile ? '20px' : '24px',
            padding: isMobile ? '16px' : '25px',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.3s',
        },
        orderHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0',
            marginBottom: isMobile ? '16px' : '20px',
            paddingBottom: isMobile ? '16px' : '20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        orderIdBlock: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            gap: '4px',
        },
        orderIdLabel: {
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '800',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
        },
        orderDate: {
            fontSize: isMobile ? '11px' : '12px',
            color: '#555',
        },
        statusBadge: {
            padding: isMobile ? '5px 12px' : '6px 14px',
            borderRadius: '12px',
            fontSize: isMobile ? '10px' : '11px',
            fontWeight: '800',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
        },
        orderBody: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0',
        },
        orderItems: {
            fontSize: isMobile ? '13px' : '14px',
            color: '#888',
            fontWeight: '500',
        },
        viewOrderBtn: {
            width: isMobile ? '100%' : 'auto',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'white',
            padding: isMobile ? '10px 16px' : '8px 16px',
            borderRadius: '12px',
            fontSize: isMobile ? '13px' : '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
        },
        securityForm: {
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '24px' : '30px',
        },
        alertBox: {
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            padding: isMobile ? '16px' : '20px',
            borderRadius: isMobile ? '14px' : '16px',
            display: 'flex',
            gap: isMobile ? '12px' : '15px',
            alignItems: 'flex-start',
        },
        alertText: {
            fontSize: isMobile ? '12px' : '13px',
            color: '#888',
            lineHeight: '1.6',
        },
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 991);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        if (tab && ['details', 'orders', 'settings', 'payment', 'notifications'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const fetchProfileAndOrders = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                const [profileRes, ordersRes] = await Promise.all([
                    axios.get('/api/users/profile', config),
                    axios.get('/api/orders/myorders', config)
                ]);

                const profile = profileRes.data;
                setForm({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                    city: profile.city || '',
                    zipCode: profile.zipCode || '',
                    password: '',
                    confirmPassword: ''
                });
                setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndOrders();
    }, [userInfo, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (activeTab === 'settings') {
            if (!form.password) return toast.error('Please enter new password');
            if (form.password !== form.confirmPassword) {
                return toast.error('Passwords do not match');
            }
            if (form.password.length < 6) {
                return toast.error('Password must be at least 6 characters');
            }
        }

        setUpdating(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put('/api/users/profile', form, config);
            login(data);
            toast.success('Profile updated successfully');
            if (activeTab === 'settings') {
                setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLocationSelect = (data) => {
        setForm({
            ...form,
            address: data.address || '',
            city: data.city || '',
            zipCode: data.pincode || '',
            lat: data.lat,
            lng: data.lng
        });
        setShowMap(false);
        toast.success('Location captured from map!');
    };

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={styles.spinner}
                />
                <p style={styles.loadingText}>SYNCHRONIZING PROFILE...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Mobile Menu Overlay */}
            {isMobile && showMobileMenu && (
                <div style={styles.sidebarOverlay} onClick={() => setShowMobileMenu(false)} />
            )}

            <div style={styles.container}>
                
                {/* Mobile Menu Toggle */}
                {isMobile && (
                    <div style={styles.mobileMenuToggle} onClick={() => setShowMobileMenu(true)}>
                        <span style={styles.mobileMenuText}>Menu</span>
                        <Settings size={20} style={styles.mobileMenuIcon} />
                    </div>
                )}

                {/* Hero Header */}
                <div style={styles.heroSection}>
                    <div style={styles.heroGlow} />
                    <div style={styles.heroContent}>
                        <div style={styles.avatarWrapper}>
                            <div style={styles.avatar}>
                                {userInfo.name?.charAt(0).toUpperCase()}
                                <div style={styles.avatarStatus} />
                                <button style={styles.editAvatarBtn} title="Change Avatar">
                                    <Camera size={isMobile ? 12 : 14} />
                                </button>
                            </div>
                        </div>
                        <div style={styles.heroInfo}>
                            <h1 style={styles.userName}>{userInfo.name}</h1>
                            <div style={styles.userMeta}>
                                <span style={styles.metaItem}><Mail size={isMobile ? 12 : 14} /> {userInfo.email}</span>
                                <span style={styles.metaDivider}>•</span>
                                <span style={styles.metaItem}><Clock size={isMobile ? 12 : 14} /> Joined {new Date().getFullYear()}</span>
                                <span style={styles.metaDivider}>•</span>
                                <span style={styles.tierBadge}>Elite Member</span>
                            </div>
                        </div>
                        <div style={styles.statsContainer}>
                            <div style={styles.statBox}>
                                <span style={styles.statVal}>{orders.length}</span>
                                <span style={styles.statLabel}>Orders</span>
                            </div>
                            <div style={styles.statDivider} />
                            <div style={styles.statBox}>
                                <span style={styles.statVal}>₹{orders.reduce((acc, curr) => acc + curr.totalPrice, 0).toFixed(0)}</span>
                                <span style={styles.statLabel}>Spent</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.layout}>
                    {/* Navigation Sidebar */}
                    <div style={styles.sidebar}>
                        <div style={styles.navCard}>
                            {/* Menu Header with Close Button */}
                            <div style={styles.menuHeader}>
                                <span style={styles.menuTitle}>Menu</span>
                                <button 
                                    style={styles.closeBtn}
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p style={styles.sectionTitle}>ACCOUNT MENU</p>
                            <div style={styles.navLinks}>
                                {[
                                    { id: 'details', label: 'Personal Details', icon: <User size={isMobile ? 18 : 18} /> },
                                    { id: 'orders', label: 'Order History', icon: <Package size={isMobile ? 18 : 18} /> },
                                    { id: 'settings', label: 'Security & Password', icon: <Lock size={isMobile ? 18 : 18} /> },
                                    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={isMobile ? 18 : 18} /> },
                                    { id: 'notifications', label: 'Notifications', icon: <Bell size={isMobile ? 18 : 18} /> },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            if (isMobile) setShowMobileMenu(false);
                                        }}
                                        style={{
                                            ...styles.navItem,
                                            background: activeTab === tab.id ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                            color: activeTab === tab.id ? '#ef4444' : '#888',
                                            paddingLeft: activeTab === tab.id ? (isMobile ? '24px' : '24px') : (isMobile ? '16px' : '20px'),
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                        </div>
                                        {activeTab === tab.id && <motion.div layoutId="active" style={styles.activeIndicator} />}
                                    </button>
                                ))}
                            </div>

                            <div style={styles.navDivider} />

                            {/* Colorful Logout Button */}
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                <LogOut size={isMobile ? 18 : 20} />
                                Logout Session
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={styles.content}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                style={styles.contentCard}
                            >
                                {activeTab === 'details' && (
                                    <div style={styles.tabContent}>
                                        <div style={styles.tabHeader}>
                                            <h2 style={styles.tabTitle}>Personal <span style={{ color: '#ef4444' }}>Profile</span></h2>
                                            <p style={styles.tabSub}>Manage your personal information and contact details</p>
                                        </div>

                                        <form onSubmit={handleSubmit} style={styles.formGrid}>
                                            <div style={styles.inputGroupFull}>
                                                <label style={styles.label}>Full Legal Name</label>
                                                <div style={styles.inputWrapper}>
                                                    <User size={isMobile ? 16 : 18} style={styles.inputIcon} />
                                                    <input
                                                        type="text"
                                                        value={form.name}
                                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                                        style={styles.input}
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                            </div>

                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Email Address</label>
                                                <div style={styles.inputWrapper}>
                                                    <Mail size={isMobile ? 16 : 18} style={styles.inputIcon} />
                                                    <input
                                                        type="email"
                                                        value={form.email}
                                                        onChange={(e) => setForm({...form, email: e.target.value})}
                                                        style={styles.input}
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Primary Phone</label>
                                                <div style={styles.inputWrapper}>
                                                    <Phone size={isMobile ? 16 : 18} style={styles.inputIcon} />
                                                    <input
                                                        type="tel"
                                                        value={form.phone}
                                                        onChange={(e) => setForm({...form, phone: e.target.value})}
                                                        style={styles.input}
                                                        placeholder="+91 00000 00000"
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ ...styles.formSectionTitle, justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <MapPin size={isMobile ? 16 : 18} />
                                                    <span>Default Delivery Address</span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowMap(true)}
                                                    style={{ 
                                                        background: 'rgba(239, 68, 68, 0.1)', 
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '20px',
                                                        padding: '4px 12px',
                                                        color: '#ef4444',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <NavIcon size={12} />
                                                    Pinpoint on Map
                                                </button>
                                            </div>

                                            <div style={styles.inputGroupFull}>
                                                <label style={styles.label}>Street/Building</label>
                                                <input
                                                    type="text"
                                                    value={form.address}
                                                    onChange={(e) => setForm({...form, address: e.target.value})}
                                                    style={styles.inputNoIcon}
                                                    placeholder="House No, Street Name"
                                                />
                                            </div>

                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>City</label>
                                                <input
                                                    type="text"
                                                    value={form.city}
                                                    onChange={(e) => setForm({...form, city: e.target.value})}
                                                    style={styles.inputNoIcon}
                                                    placeholder="City Name"
                                                />
                                            </div>

                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>PIN Code</label>
                                                <input
                                                    type="text"
                                                    value={form.zipCode}
                                                    onChange={(e) => setForm({...form, zipCode: e.target.value})}
                                                    style={styles.inputNoIcon}
                                                    placeholder="6 Digit PIN"
                                                />
                                            </div>

                                            <div style={styles.actionWrapper}>
                                                <button
                                                    type="submit"
                                                    disabled={updating}
                                                    style={styles.saveBtn}
                                                >
                                                    {updating ? <Loader size={isMobile ? 18 : 20} className="animate-spin" /> : <Save size={isMobile ? 18 : 18} />}
                                                    {updating ? 'Securing Data...' : 'Synchronize Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div style={styles.tabContent}>
                                        <div style={styles.tabHeader}>
                                            <h2 style={styles.tabTitle}>Order <span style={{ color: '#ef4444' }}>Chronicle</span></h2>
                                            <p style={styles.tabSub}>Review and track your culinary adventures</p>
                                        </div>

                                        {orders.length === 0 ? (
                                            <div style={styles.emptyState}>
                                                <div style={styles.emptyIcon}>
                                                    <Package size={isMobile ? 30 : 40} />
                                                </div>
                                                <h3 style={styles.emptyTitle}>The vault is empty</h3>
                                                <p style={styles.emptySub}>Your order history will appear here once you place your first order.</p>
                                                <button onClick={() => navigate('/')} style={styles.browseBtn}>Start Exploring Menu</button>
                                            </div>
                                        ) : (
                                            <div style={styles.ordersList}>
                                                {orders.map(order => (
                                                    <div key={order._id} style={styles.orderCard}>
                                                        <div style={styles.orderHeader}>
                                                            <div style={styles.orderIdBlock}>
                                                                <span style={styles.orderIdLabel}>ID: #{order._id.slice(-8).toUpperCase()}</span>
                                                                <span style={styles.orderDate}>
                                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { 
                                                                        month: 'short', 
                                                                        day: 'numeric', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                ...styles.statusBadge,
                                                                background: order.status === 'Delivered' ? 'rgba(34, 197, 94, 0.15)' : 
                                                                            order.status === 'Cancelled' ? 'rgba(100, 100, 100, 0.1)' : 
                                                                            order.isPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                color: order.status === 'Delivered' ? '#22c55e' : 
                                                                       order.status === 'Cancelled' ? '#888' : 
                                                                       order.isPaid ? '#22c55e' : '#ef4444',
                                                                border: `1px solid ${
                                                                    order.status === 'Delivered' ? 'rgba(34, 197, 94, 0.2)' : 
                                                                    order.status === 'Cancelled' ? 'rgba(255,255,255,0.1)' : 
                                                                    order.isPaid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                                                }`
                                                            }}>
                                                                {order.status === 'Delivered' || (order.isPaid && order.status === 'Placed') ? (
                                                                    <CheckCircle size={14} />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '8px',
                                                                        height: '8px',
                                                                        background: order.status === 'Cancelled' ? '#888' : '#ef4444',
                                                                        borderRadius: '50%'
                                                                    }} />
                                                                )}
                                                                <span style={{ textTransform: 'uppercase' }}>
                                                                    {order.status === 'Placed' && order.isPaid ? 'ORDER SUCCESSFUL' : 
                                                                     order.status === 'Cancelled' ? 'CANCELLED' :
                                                                     order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={styles.orderBody}>
                                                            <div style={styles.orderItems}>
                                                                {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'} • ₹{order.totalPrice}
                                                            </div>
                                                            <button 
                                                                onClick={() => navigate(`/order/${order._id}`)}
                                                                style={styles.viewOrderBtn}
                                                            >
                                                                Details <ChevronRight size={isMobile ? 14 : 16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div style={styles.tabContent}>
                                        <div style={styles.tabHeader}>
                                            <h2 style={styles.tabTitle}>Gateway <span style={{ color: '#ef4444' }}>Security</span></h2>
                                            <p style={styles.tabSub}>Update your access credentials and protect your account</p>
                                        </div>

                                        <form onSubmit={handleSubmit} style={styles.securityForm}>
                                            <div style={styles.alertBox}>
                                                <Shield size={isMobile ? 18 : 20} color="#ef4444" />
                                                <p style={styles.alertText}>
                                                    Ensure your password is at least 8 characters long and includes a mix of characters for maximum security.
                                                </p>
                                            </div>

                                            <div style={styles.inputGroupFull}>
                                                <label style={styles.label}>New Password</label>
                                                <div style={styles.inputWrapper}>
                                                    <Lock size={isMobile ? 16 : 18} style={styles.inputIcon} />
                                                    <input
                                                        type="password"
                                                        value={form.password}
                                                        onChange={(e) => setForm({...form, password: e.target.value})}
                                                        style={styles.input}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>

                                            <div style={styles.inputGroupFull}>
                                                <label style={styles.label}>Verify New Password</label>
                                                <div style={styles.inputWrapper}>
                                                    <Lock size={isMobile ? 16 : 18} style={styles.inputIcon} />
                                                    <input
                                                        type="password"
                                                        value={form.confirmPassword}
                                                        onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                                                        style={styles.input}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>

                                            <div style={styles.actionWrapper}>
                                                <button
                                                    type="submit"
                                                    disabled={updating || !form.password}
                                                    style={{
                                                        ...styles.saveBtn,
                                                        opacity: (!form.password || updating) ? 0.5 : 1
                                                    }}
                                                >
                                                    {updating ? <Loader size={isMobile ? 18 : 20} className="animate-spin" /> : <Shield size={isMobile ? 18 : 18} />}
                                                    {updating ? 'Updating Vault...' : 'Seal Access Point'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'payment' && (
                                    <div style={styles.tabContent}>
                                        <div style={styles.tabHeader}>
                                            <h2 style={styles.tabTitle}>Payment <span style={{ color: '#ef4444' }}>Vault</span></h2>
                                            <p style={styles.tabSub}>Linked cards and transaction preferences</p>
                                        </div>
                                        <div style={styles.emptyState}>
                                            <div style={styles.emptyIcon}>
                                                <CreditCard size={isMobile ? 30 : 40} />
                                            </div>
                                            <h3 style={styles.emptyTitle}>No cards detected</h3>
                                            <p style={styles.emptySub}>Your saved payment methods will appear here.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <NotificationsTab isMobile={isMobile} styles={styles} />
                                )}
                            </motion.div>
                        </AnimatePresence>
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

            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                .animate-spin { 
                    animation: spin 1s linear infinite; 
                }
                @media (max-width: 991px) {
                    .glass {
                        backdrop-filter: blur(10px);
                    }
                }
                input:focus {
                    border-color: rgba(239, 68, 68, 0.3) !important;
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
                }
                button:hover {
                    transform: translateY(-2px);
                }
                button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default Profile;

// Separate NotificationsTab component
const NotificationsTab = ({ isMobile, styles }) => {
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, fetchUnreadCount } = useNotifications();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetchNotifications().then(() => setLoaded(true));
    }, [fetchNotifications]);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'NEW_FOOD': return '🍕';
            case 'UPDATE_FOOD': return '✨';
            case 'DELETE_FOOD': return '🚫';
            default: return '🔔';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'NEW_FOOD': return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
            case 'UPDATE_FOOD': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
            case 'DELETE_FOOD': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
            default: return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#888' };
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'NEW_FOOD': return 'New Item';
            case 'UPDATE_FOOD': return 'Updated';
            case 'DELETE_FOOD': return 'Removed';
            default: return 'Update';
        }
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
            fetchUnreadCount();
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        fetchUnreadCount();
        fetchNotifications();
    };

    const unreadNotifs = notifications.filter(n => !n.isRead);

    if (!loaded) {
        return (
            <div style={styles.tabContent}>
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        border: '3px solid rgba(239,68,68,0.1)',
                        borderTopColor: '#ef4444',
                        borderRadius: '50%',
                        margin: '0 auto',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: '#888', fontSize: '13px', marginTop: '15px' }}>Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.tabContent}>
            <div style={{ ...styles.tabHeader, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
                <div>
                    <h2 style={styles.tabTitle}>Notification <span style={{ color: '#ef4444' }}>Center</span></h2>
                    <p style={styles.tabSub}>Stay updated with menu changes and food alerts</p>
                </div>
                {unreadNotifs.length > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: isMobile ? '10px 16px' : '10px 20px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <CheckCircle size={14} />
                        Mark All Read ({unreadNotifs.length})
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                        <Bell size={isMobile ? 30 : 40} />
                    </div>
                    <h3 style={styles.emptyTitle}>No notifications yet</h3>
                    <p style={styles.emptySub}>You'll receive notifications when menu items are added, updated, or removed.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    {notifications.map(notif => {
                        const typeColor = getTypeColor(notif.type);
                        return (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                style={{
                                    background: notif.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.04)',
                                    borderRadius: isMobile ? '16px' : '20px',
                                    padding: isMobile ? '14px' : '20px',
                                    border: notif.isRead ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(239, 68, 68, 0.15)',
                                    cursor: notif.isRead ? 'default' : 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    gap: isMobile ? '12px' : '16px',
                                    alignItems: 'flex-start',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Unread indicator */}
                                {!notif.isRead && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '3px',
                                        background: '#ef4444',
                                        borderRadius: '0 3px 3px 0'
                                    }} />
                                )}

                                {/* Icon or Image */}
                                {notif.image ? (
                                    <div style={{
                                        width: isMobile ? '48px' : '56px',
                                        height: isMobile ? '48px' : '56px',
                                        borderRadius: isMobile ? '14px' : '16px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <img
                                            src={notif.image}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: isMobile ? '48px' : '56px',
                                        height: isMobile ? '48px' : '56px',
                                        borderRadius: isMobile ? '14px' : '16px',
                                        background: typeColor.bg,
                                        border: `1px solid ${typeColor.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isMobile ? '20px' : '24px',
                                        flexShrink: 0
                                    }}>
                                        {getTypeIcon(notif.type)}
                                    </div>
                                )}

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        marginBottom: '6px'
                                    }}>
                                        <h4 style={{
                                            fontSize: isMobile ? '14px' : '15px',
                                            fontWeight: notif.isRead ? '600' : '700',
                                            color: notif.isRead ? '#aaa' : '#fff',
                                            margin: 0,
                                            lineHeight: 1.3,
                                            flex: 1
                                        }}>
                                            {notif.title}
                                        </h4>
                                        <span style={{
                                            fontSize: isMobile ? '10px' : '11px',
                                            color: '#555',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}>
                                            {timeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: notif.isRead ? '#666' : '#888',
                                        margin: 0,
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {notif.message}
                                    </p>
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            background: typeColor.bg,
                                            color: typeColor.text,
                                            border: `1px solid ${typeColor.border}`,
                                            padding: '2px 10px',
                                            borderRadius: '10px',
                                            fontSize: isMobile ? '9px' : '10px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {getTypeLabel(notif.type)}
                                        </span>
                                        {!notif.isRead && (
                                            <span style={{
                                                fontSize: isMobile ? '10px' : '11px',
                                                color: '#ef4444',
                                                fontWeight: '600'
                                            }}>
                                                • Tap to mark read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};