import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, MapPin, Menu, X, User, ChefHat, Loader, LogOut, Package, Settings, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
    const { cartItems } = useCart();
    const { userInfo, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const routerLocation = useLocation();
    const currentPath = routerLocation.pathname;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    // Fix: Initialize with proper window check
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 980;
        }
        return false;
    });
    const [location, setLocation] = useState({ city: 'Loading...', country: '...' });
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileDropdownOpen(false);
        // Refresh the page to clear any cached state
        window.location.reload();
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchQuery.trim()) {
                navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            }
        }
    };

    // Fetch user location
    useEffect(() => {
        const fetchLocation = async () => {
            setIsLoadingLocation(true);

            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            try {
                                const { latitude, longitude } = position.coords;

                                // zoom=18 gives street-level precision (suburb/neighbourhood)
                                const response = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                                    { headers: { 'Accept-Language': 'en' } }
                                );
                                const data = await response.json();
                                const a = data.address || {};

                                // Pick the most granular locality available
                                // Nominatim fields from most precise → least precise:
                                const locality =
                                    a.neighbourhood ||
                                    a.suburb ||
                                    a.quarter ||
                                    a.village ||
                                    a.hamlet ||
                                    a.town ||
                                    a.residential ||
                                    a.road ||
                                    null;

                                // City / district level
                                const cityLevel =
                                    a.city_district ||
                                    a.county ||
                                    a.city ||
                                    a.town ||
                                    a.state_district ||
                                    a.state ||
                                    null;

                                // Build display: "Locality, City" or just one of them
                                let displayCity = '';
                                if (locality && cityLevel && locality !== cityLevel) {
                                    displayCity = `${locality}, ${cityLevel}`;
                                } else {
                                    displayCity = locality || cityLevel || 'Unknown';
                                }

                                // Country / state for 2nd part
                                const displayCountry = a.state || a.country || 'India';

                                setLocation({ city: displayCity, country: displayCountry });
                                setLocationError(false);
                            } catch (error) {
                                console.error('Error fetching location details:', error);
                                fallbackToIPLocation();
                            } finally {
                                setIsLoadingLocation(false);
                            }
                        },
                        (error) => {
                            console.log('Geolocation error:', error);
                            fallbackToIPLocation();
                        },
                        {
                            enableHighAccuracy: true,  // Use GPS chip, not network triangulation
                            timeout: 10000,            // Wait up to 10 seconds
                            maximumAge: 0              // Never use a cached position
                        }
                    );
                } else {
                    fallbackToIPLocation();
                }
            } catch (error) {
                console.error('Location error:', error);
                fallbackToIPLocation();
            }
        };

        const fallbackToIPLocation = async () => {
            try {
                // IP-based location (less accurate but better than nothing)
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                // ipapi gives city at ISP level - show with region for clarity
                const city = data.city || 'Unknown';
                const region = data.region || data.country_name || 'India';

                setLocation({ city, country: region });
                setLocationError(false);
            } catch (error) {
                console.error('IP location error:', error);
                setLocation({ city: 'Kolkata', country: 'India' });
                setLocationError(true);
            } finally {
                setIsLoadingLocation(false);
            }
        };

        fetchLocation();
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 980);
        };

        // Add resize listener
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    // Close mobile menu when switching to desktop
    useEffect(() => {
        if (!isMobile) {
            setIsMenuOpen(false);
        }
    }, [isMobile]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <>
            <style>{`
                @keyframes bellPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    color: #ccc;
                    text-decoration: none;
                    font-size: 14px;
                    border-radius: 12px;
                    transition: all 0.2s;
                    width: 100%;
                    border: none;
                    background: transparent;
                    text-align: left;
                    cursor: pointer;
                }
                .dropdown-item:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
                .nav-link {
                    color: #888;
                    font-weight: 500;
                    font-size: 18px;
                    text-decoration: none;
                    padding: 8px 16px;
                    border-radius: 30px;
                    transition: all 0.3s ease;
                }
                .nav-link:hover {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }
                .nav-link.active {
                    color: white;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                
                @media (max-width: 400px) {
                    .nav-logo-text { font-size: 15px !important; }
                    .nav-container { padding: 10px 12px !important; }
                    .mobile-action-icon { width: 36px !important; height: 36px !important; }
                    .logo-icon-container { width: 34px !important; height: 34px !important; }
                }

                .nav-logo-inner {
                    display: flex;
                    align-items: center;
                    gap: 0px;
                }

                @media (max-width: 350px) {
                    .nav-logo-inner {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        line-height: 1 !important;
                    }
                    .mobile-action-gap { gap: 6px !important; }
                    .nav-container { padding: 8px 10px !important; }
                }
            `}</style>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="nav-container"
                style={{
                    margin: 0,
                    padding: isMobile ? '12px 20px' : '12px 30px',
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: isScrolled ? 'rgba(10, 10, 15, 0.98)' : 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.3)' : 'none',
                    transition: 'all 0.3s ease',
                    width: '100%'
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {/* Top row - Logo and Desktop Menu */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: isMobile ? '10px' : '30px',
                        width: '100%'
                    }}>
                        {/* Logo */}
                        <Link to={userInfo?.isDriver ? "/driver/dashboard" : "/"} onClick={closeMenu} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0px',
                            textDecoration: 'none'
                        }}>
                            <img
                                src="/brand_logo.jpg"
                                alt="Momo Plaza"
                                className="logo-icon-container"
                                style={{
                                    height: isMobile ? '44px' : '54px',
                                    width: isMobile ? '44px' : '54px',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    borderRadius: '50%',
                                    border: '2px solid rgba(239,68,68,0.5)',
                                    boxShadow: '0 0 16px rgba(239,68,68,0.35)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = '0 0 28px rgba(239,68,68,0.7)';
                                    e.currentTarget.style.borderColor = '#ef4444';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = '0 0 16px rgba(239,68,68,0.35)';
                                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                                }}
                            />
                        </Link>

                        {/* Desktop Search Bar */}
                        {!isMobile && !userInfo?.isDriver && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                flex: 1,
                                maxWidth: '500px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '40px',
                                padding: '5px 5px 5px 15px',
                                transition: 'all 0.3s'
                            }}>
                                <Search size={18} color="#888" style={{ cursor: 'pointer' }} onClick={handleSearch} />
                                <input
                                    type="text"
                                    placeholder="Search for dishes, restaurants, cuisines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        width: '100%',
                                        outline: 'none',
                                        fontSize: '14px',
                                        padding: '12px 10px'
                                    }}
                                />
                            </div>
                        )}

                        {/* Desktop Menu */}
                        {!isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                {!userInfo?.isDriver ? (
                                    <>
                                        <Link to="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
                                            Home
                                        </Link>
                                        <Link to="/menu" className={`nav-link ${currentPath === '/menu' ? 'active' : ''}`}>
                                            Menu
                                        </Link>
                                        <Link to="/offers" className={`nav-link ${currentPath === '/offers' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Offers
                                            <span style={{
                                                background: '#ef4444',
                                                padding: '3px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                color: 'white'
                                            }}>
                                                NEW
                                            </span>
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/driver/dashboard" className={`nav-link ${currentPath === '/driver/dashboard' ? 'active' : ''}`}>
                                        Dashboard
                                    </Link>
                                )}

                                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

                                {userInfo ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            position: 'relative',
                                            paddingBottom: '10px',
                                            marginBottom: '-10px'
                                        }}
                                            onMouseEnter={() => setIsProfileDropdownOpen(true)}
                                            onMouseLeave={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '50%',
                                                        width: '45px',
                                                        height: '45px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        overflow: 'hidden',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '18px'
                                                    }}>
                                                        {userInfo.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </button>

                                                <AnimatePresence>
                                                    {isProfileDropdownOpen && (
                                                        <>
                                                            <div
                                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                                                                onClick={() => setIsProfileDropdownOpen(false)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '60px',
                                                                    right: 0,
                                                                    width: '240px',
                                                                    background: '#1a1a1f',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    borderRadius: '20px',
                                                                    padding: '10px',
                                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                                                    zIndex: 100
                                                                }}
                                                            >
                                                                <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                                                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{userInfo.name}</p>
                                                                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{userInfo.email}</p>
                                                                </div>
                                                                {!userInfo?.isDriver ? (
                                                                    <>
                                                                        <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className={`dropdown-item ${currentPath === '/profile' ? 'active' : ''}`}>
                                                                            <User size={16} /> Profile Settings
                                                                        </Link>
                                                                        <Link to="/profile?tab=orders" onClick={() => setIsProfileDropdownOpen(false)} className={`dropdown-item ${routerLocation.search === '?tab=orders' ? 'active' : ''}`}>
                                                                            <Package size={16} /> My Orders
                                                                        </Link>
                                                                    </>
                                                                ) : (
                                                                    <Link to="/driver/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className={`dropdown-item ${currentPath === '/driver/dashboard' ? 'active' : ''}`}>
                                                                        <Package size={16} /> Dashboard
                                                                    </Link>
                                                                )}
                                                                {userInfo?.isAdmin && (
                                                                    <Link to="/admin" onClick={() => setIsProfileDropdownOpen(false)} className={`dropdown-item ${currentPath === '/admin' ? 'active' : ''}`} style={{ color: '#ec4899' }}>
                                                                        <Settings size={16} /> Admin Panel
                                                                    </Link>
                                                                )}
                                                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '5px 0' }} />
                                                                <button onClick={handleLogout} className="dropdown-item" style={{ color: '#ef4444' }}>
                                                                    <LogOut size={16} /> Log Out
                                                                </button>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                padding: '8px 16px',
                                                borderRadius: '30px',
                                                color: '#ef4444',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link to="/login" style={{
                                            color: '#888',
                                            fontWeight: '500',
                                            fontSize: '18px',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <User size={16} />
                                            Log in
                                        </Link>
                                        <Link
                                            to="/signup"
                                            style={{
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                color: 'white',
                                                padding: '10px 24px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                borderRadius: '40px',
                                                boxShadow: '0 10px 20px rgba(239,68,68,0.3)'
                                            }}
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}

                                {/* Location Display Beside Cart */}
                                {!userInfo?.isDriver && (
                                    <>
                                        {/* Notification Bell */}
                                        {userInfo && (
                                            <Link to="/profile?tab=notifications" style={{ position: 'relative', textDecoration: 'none' }}>
                                                <div style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.3s',
                                                    cursor: 'pointer'
                                                }}>
                                                    <Bell size={18} color={unreadCount > 0 ? '#ef4444' : '#888'} />
                                                </div>
                                                {unreadCount > 0 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-4px',
                                                        right: '-4px',
                                                        background: '#ef4444',
                                                        borderRadius: '50%',
                                                        padding: '2px 6px',
                                                        fontSize: '10px',
                                                        minWidth: '18px',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                        color: 'white',
                                                        border: '2px solid #0a0a0f',
                                                        animation: 'bellPulse 2s infinite'
                                                    }}>
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
                                            </Link>
                                        )}

                                        <div
                                            title={isLoadingLocation ? 'Detecting location...' : `${location.city}, ${location.country}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '7px',
                                                background: isLoadingLocation ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.1)',
                                                padding: '5px 14px',
                                                borderRadius: '40px',
                                                border: `1px solid ${locationError ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.3)'}`,
                                                marginRight: '5px',
                                                maxWidth: '220px',
                                                cursor: 'default'
                                            }}>
                                            {isLoadingLocation ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Loader size={16} color="#888" />
                                                </motion.div>
                                            ) : (
                                                <MapPin size={15} color={locationError ? "#888" : "#ef4444"} style={{ flexShrink: 0 }} />
                                            )}
                                            {isLoadingLocation ? (
                                                <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Detecting...</span>
                                            ) : (
                                                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: locationError ? '#888' : '#ef4444',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: 1.2
                                                    }}>
                                                        {location.city}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: 'rgba(255,255,255,0.45)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: 1.2
                                                    }}>
                                                        {location.country}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cart Icon */}
                                        <Link to="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                background: 'rgba(239,68,68,0.1)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid rgba(239,68,68,0.3)'
                                            }}>
                                                <ShoppingCart size={20} color="#ef4444" />
                                            </div>
                                            {cartItems.length > 0 && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    background: '#ef4444',
                                                    borderRadius: '50%',
                                                    padding: '2px 6px',
                                                    fontSize: '11px',
                                                    minWidth: '20px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    border: '2px solid #0a0a0f'
                                                }}>
                                                    {cartItems.length}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mobile Header */}
                        {isMobile && (
                            <div className="mobile-action-gap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Notification Bell - Mobile */}
                                {userInfo && !userInfo?.isDriver && (
                                    <Link to="/profile?tab=notifications" onClick={closeMenu} style={{ position: 'relative' }}>
                                        <div 
                                            className="mobile-action-icon"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <Bell size={16} color={unreadCount > 0 ? '#ef4444' : '#888'} />
                                        </div>
                                        {unreadCount > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '-2px',
                                                right: '-2px',
                                                background: '#ef4444',
                                                borderRadius: '50%',
                                                padding: '2px 5px',
                                                fontSize: '9px',
                                                minWidth: '16px',
                                                textAlign: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                border: '2px solid #0a0a0f',
                                                animation: 'bellPulse 2s infinite'
                                            }}>
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                {/* Cart Icon */}
                                {!userInfo?.isDriver && (
                                    <Link to="/cart" onClick={closeMenu} style={{ position: 'relative' }}>
                                    <div 
                                        className="mobile-action-icon"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(239,68,68,0.1)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(239,68,68,0.3)'
                                        }}
                                    >
                                        <ShoppingCart size={18} color="#ef4444" />
                                    </div>
                                    {cartItems.length > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-2px',
                                            right: '-2px',
                                            background: '#ef4444',
                                            borderRadius: '50%',
                                            padding: '2px 5px',
                                            fontSize: '10px',
                                            minWidth: '18px',
                                            textAlign: 'center',
                                            color: 'white',
                                            border: '2px solid #0a0a0f'
                                        }}>
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                                )}
                                {/* Burger Button */}
                                <button
                                    onClick={toggleMenu}
                                    className="mobile-action-icon"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: isMenuOpen ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                        border: isMenuOpen ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: isMenuOpen ? 'white' : '#888',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Search Bar - Now inside the nav container */}
                    {isMobile && !isMenuOpen && !userInfo?.isDriver && (
                        <div style={{
                            marginTop: '12px',
                            width: '100%'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: '40px',
                                padding: '4px 6px 4px 12px',
                                gap: '6px',
                                width: '100%'
                            }}>
                                <Search size={16} color="#888" onClick={handleSearch} />

                                <input
                                    type="text"
                                    placeholder="Search dishes, restaurants..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        flex: 1,
                                        outline: 'none',
                                        fontSize: '14px',
                                        padding: '8px 0',
                                        minWidth: 0
                                    }}
                                />

                                {/* Location */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: isLoadingLocation ? 'transparent' : 'rgba(239,68,68,0.1)',
                                    padding: '4px 10px',
                                    borderRadius: '30px',
                                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                                    flexShrink: 0
                                }}>
                                    {isLoadingLocation ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Loader size={12} color="#888" />
                                        </motion.div>
                                    ) : (
                                        <MapPin size={12} color="#ef4444" />
                                    )}

                                    <span style={{
                                        fontSize: '12px',
                                        color: isLoadingLocation ? '#888' : '#ef4444',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {isLoadingLocation ? 'Detecting...' : location.city}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && isMobile && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.8)',
                                backdropFilter: 'blur(10px)',
                                zIndex: 998
                            }}
                            onClick={closeMenu}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                width: 'min(320px, 85%)',
                                height: '100vh',
                                background: '#0f0f14',
                                borderLeft: '1px solid rgba(239,68,68,0.2)',
                                zIndex: 999,
                                padding: '80px 20px 30px',
                                overflowY: 'auto',
                                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            {/* Location Display in Menu */}
                            {!userInfo?.isDriver && (
                                <div style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    borderRadius: '30px',
                                    padding: '15px',
                                    marginBottom: '25px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(239,68,68,0.2)'
                                }}>
                                    {isLoadingLocation ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Loader size={20} color="#ef4444" />
                                        </motion.div>
                                    ) : (
                                        <MapPin size={20} color="#ef4444" />
                                    )}
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>Delivering to</div>
                                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>
                                            {isLoadingLocation ? 'Detecting location...' : `${location.city}, ${location.country}`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Greeting */}
                            <div style={{
                                marginBottom: '25px',
                                padding: '0 5px'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 5px 0' }}>
                                    {userInfo ? `Hi, ${userInfo.name} 👋` : 'Hello there! 👋'}
                                </h3>
                                <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                                    {userInfo ? 'Ready for some delicious food?' : 'Sign in for personalized recommendations'}
                                </p>
                            </div>

                            {/* Navigation Links */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {!userInfo?.isDriver ? (
                                    <>
                                        <Link
                                            to="/"
                                            onClick={closeMenu}
                                            style={{
                                                padding: '16px 20px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '16px',
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>🏠</span>
                                            Home
                                        </Link>
                                        {userInfo && (
                                            <Link
                                                to="/profile"
                                                onClick={closeMenu}
                                                style={{
                                                    padding: '16px 20px',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '16px',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <span style={{ fontSize: '20px' }}>👤</span>
                                                My Profile
                                            </Link>
                                        )}
                                        <Link
                                            to="/menu"
                                            onClick={closeMenu}
                                            style={{
                                                padding: '16px 20px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '16px',
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>🍽️</span>
                                            Menu
                                        </Link>
                                        <Link
                                            to="/offers"
                                            onClick={closeMenu}
                                            style={{
                                                padding: '16px 20px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '16px',
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '20px' }}>🔥</span>
                                                Offers
                                            </span>
                                            <span style={{
                                                background: '#ef4444',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                color: 'white'
                                            }}>
                                                NEW
                                            </span>
                                        </Link>
                                        {userInfo?.isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={closeMenu}
                                                style={{
                                                    padding: '16px 20px',
                                                    background: 'rgba(236, 72, 153, 0.1)',
                                                    borderRadius: '16px',
                                                    color: '#ec4899',
                                                    textDecoration: 'none',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    border: '1px solid rgba(236, 72, 153, 0.3)'
                                                }}
                                            >
                                                <span style={{ fontSize: '20px' }}>⚙️</span>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link
                                            to="/cart"
                                            onClick={closeMenu}
                                            style={{
                                                padding: '16px 20px',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '16px',
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '20px' }}>🛒</span>
                                                Cart
                                            </span>
                                            {cartItems.length > 0 && (
                                                <span style={{
                                                    background: '#ef4444',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: 'white'
                                                }}>
                                                    {cartItems.length}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to="/driver/dashboard"
                                        onClick={closeMenu}
                                        style={{
                                            padding: '16px 20px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '16px',
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>🚚</span>
                                        Driver Dashboard
                                    </Link>
                                )}
                            </div>

                            {/* Auth Section */}
                            <div style={{
                                marginTop: '25px',
                                padding: '20px 0',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {userInfo ? (
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            closeMenu();
                                        }}
                                        style={{
                                            padding: '14px',
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            borderRadius: '30px',
                                            color: '#ef4444',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <LogOut size={18} />
                                        Log Out
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={closeMenu}
                                            style={{
                                                padding: '14px',
                                                background: 'transparent',
                                                border: '1px solid rgba(239,68,68,0.3)',
                                                borderRadius: '30px',
                                                color: '#ef4444',
                                                textDecoration: 'none',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                display: 'block'
                                            }}
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={closeMenu}
                                            style={{
                                                padding: '14px',
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                border: 'none',
                                                borderRadius: '30px',
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                display: 'block',
                                                boxShadow: '0 10px 20px rgba(239,68,68,0.3)'
                                            }}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Footer Links */}
                            <div style={{
                                marginTop: '25px',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '25px',
                                fontSize: '13px',
                                color: '#666'
                            }}>
                                <span style={{ cursor: 'pointer' }}>About</span>
                                <span style={{ cursor: 'pointer' }}>Contact</span>
                                <span style={{ cursor: 'pointer' }}>FAQ</span>
                            </div>
                            <p style={{
                                marginTop: '15px',
                                fontSize: '11px',
                                color: '#444',
                                textAlign: 'center'
                            }}>
                                © 2024 MEALMATRIX
                            </p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;