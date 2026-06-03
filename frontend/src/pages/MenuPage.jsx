import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Star, Clock, Heart, ShoppingCart, 
    ChevronRight, X, SlidersHorizontal, Leaf, Beef, 
    ChevronDown, TrendingUp, DollarSign, Sparkles,
    Salad, Pizza, Coffee, IceCream, Soup, RotateCcw,
    MapPin, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Loader Component with Red Theme
const Loader = () => {
    return (
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
                background: '#07070a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        borderRadius: ['30% 70% 70% 30% / 30% 30% 70% 70%', '50% 50% 50% 50% / 50% 50% 50% 50%', '30% 70% 70% 30% / 30% 30% 70% 70%']
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 30px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        boxShadow: '0 0 50px rgba(239,68,68,0.5)'
                    }}
                />
                <motion.div
                    animate={{ 
                        width: ['0%', '100%'],
                        opacity: [1, 0.5, 1]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        height: '4px',
                        background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                        borderRadius: '2px',
                        marginBottom: '20px'
                    }}
                />
                <motion.h2
                    animate={{ 
                        opacity: [0.5, 1, 0.5],
                        y: [0, -5, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ color: 'white', fontSize: '24px', marginBottom: '10px' }}
                >
                    Preparing Your Feast
                </motion.h2>
                <motion.p
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    style={{ color: '#888' }}
                >
                    Loading gourmet experiences...
                </motion.p>
            </div>
        </motion.div>
    );
};

const MenuPage = () => {
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [vegOnly, setVegOnly] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [cart, setCart] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const categoryScrollRef = useRef(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userInfo && userInfo.isDriver) {
            navigate('/driver/dashboard');
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        
        const fetchMenu = async () => {
            try {
                const { data } = await axios.get('/api/menu');
                // Ensure data is always an array
                setMenuItems(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching menu:', err);
                setMenuItems([]);
                setLoading(false);
            }
        };
        fetchMenu();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check if any filters are active (excluding default "All" category)
    const hasActiveFilters = useMemo(() => {
        return selectedCategory !== 'All' || 
               searchQuery !== '' || 
               priceRange[0] > 0 || // Check if min price is changed from default
               priceRange[1] < 2000 || 
               vegOnly || 
               sortBy !== '';
    }, [selectedCategory, searchQuery, priceRange, vegOnly, sortBy]);

    const categories = [
        { 
            name: 'All', 
            img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', 
            count: menuItems.length, 
            color: '#ef4444' 
        },
        { 
            name: 'Starters', 
            img: 'https://5.imimg.com/data5/SELLER/Default/2021/9/WK/YL/RM/125386639/chicken-popcorn-500x500.jpg', 
            count: menuItems.filter(i => i.category === 'Starters').length, 
            color: '#f97316' 
        },
        { 
            name: 'Main Course', 
            img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', 
            count: menuItems.filter(i => i.category === 'Main Course').length, 
            color: '#8b5cf6' 
        },
        { 
            name: 'Chinese', 
            img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80', 
            count: menuItems.filter(i => i.category === 'Chinese').length, 
            color: '#06b6d4' 
        },
        { 
            name: 'Beverages', 
            img: 'https://vaya.in/careers/wp-content/uploads/2019/03/5-protein-drinks-and-beverages-to-have-post-work-out.jpg', 
            count: menuItems.filter(i => i.category === 'Beverages').length, 
            color: '#ec4899' 
        },
        { 
            name: 'Desserts', 
            img: 'https://shop.chudleighs.com/cdn/shop/products/MoltenChocolateLavaCake_086_720x.jpg?v=1616096917', 
            count: menuItems.filter(i => i.category === 'Desserts').length, 
            color: '#f59e0b' 
        },
    ];

    // Filter and sort items
    const filteredItems = useMemo(() => {
        return menuItems
            .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())))
            .filter(item => item.price >= priceRange[0] && item.price <= priceRange[1])
            .filter(item => !vegOnly || item.isVeg)
            .sort((a, b) => {
                switch(sortBy) {
                    case 'price-low': return a.price - b.price;
                    case 'price-high': return b.price - a.price;
                    case 'rating': return b.rating - a.rating;
                    case 'popular': return b.orders - a.orders;
                    default: return 0;
                }
            });
    }, [selectedCategory, searchQuery, priceRange, vegOnly, sortBy, menuItems]);

    const getCategoryCount = (categoryName) => {
        if (categoryName === 'All') return menuItems.length;
        return menuItems.filter(item => item.category === categoryName).length;
    };

    const toggleFavorite = (itemId) => {
        setFavorites(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategory('All');
        setSearchQuery('');
        setPriceRange([0, 2000]);
        setVegOnly(false);
        setSortBy('');
        setShowFilters(false);
        setShowMobileFilters(false);
    };

    const scrollCategories = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Sort options
    const sortOptions = [
        { value: 'popular', label: 'Most Popular', icon: <TrendingUp size={16} /> },
        { value: 'rating', label: 'Top Rated', icon: <Star size={16} /> },
        { value: 'price-low', label: 'Price: Low to High', icon: <DollarSign size={16} /> },
        { value: 'price-high', label: 'Price: High to Low', icon: <DollarSign size={16} /> },
    ];

    return (
        <div style={styles.page}>
            <AnimatePresence>
                {loading && <Loader />}
            </AnimatePresence>
            {/* Mobile Filter Modal */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={styles.modalOverlay}
                            onClick={() => setShowMobileFilters(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            style={styles.mobileFilters}
                        >
                            <div style={styles.mobileFiltersHeader}>
                                <h3 style={styles.mobileFiltersTitle}>Filters</h3>
                                <button 
                                    style={styles.closeModalBtn}
                                    onClick={() => setShowMobileFilters(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div style={styles.mobileFiltersContent}>
                                <div style={styles.mobileFilterSection}>
                                    <label style={styles.filterLabel}>Sort By</label>
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={styles.mobileSelect}
                                    >
                                        <option value="">Recommended</option>
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.mobileFilterSection}>
                                    <label style={styles.filterLabel}>Price Range</label>
                                    <div style={styles.mobilePriceRange}>
                                        <span style={styles.priceValue}>₹{priceRange[0]}</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2000"
                                            step="50"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                            style={styles.rangeInput}
                                        />
                                        <span style={styles.priceValue}>₹{priceRange[1]}</span>
                                    </div>
                                    <div style={styles.pricePresets}>
                                        <button onClick={() => setPriceRange([0, 300])}>Under ₹300</button>
                                        <button onClick={() => setPriceRange([300, 500])}>₹300-₹500</button>
                                        <button onClick={() => setPriceRange([500, 1000])}>Above ₹500</button>
                                    </div>
                                </div>

                                <div style={styles.mobileFilterSection}>
                                    <label style={styles.filterLabel}>Dietary</label>
                                    <div style={styles.dietOptions}>
                                        <button
                                            onClick={() => setVegOnly(false)}
                                            style={{
                                                ...styles.dietButton,
                                                background: !vegOnly ? 'rgba(239,68,68,0.1)' : 'transparent',
                                                borderColor: !vegOnly ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                                color: !vegOnly ? '#ef4444' : '#888'
                                            }}
                                        >
                                            <Beef size={18} />
                                            All
                                        </button>
                                        <button
                                            onClick={() => setVegOnly(true)}
                                            style={{
                                                ...styles.dietButton,
                                                background: vegOnly ? 'rgba(34,197,94,0.1)' : 'transparent',
                                                borderColor: vegOnly ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                                color: vegOnly ? '#22c55e' : '#888'
                                            }}
                                        >
                                            <Leaf size={18} />
                                            Veg
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={clearAllFilters}
                                    style={styles.clearAllBtn}
                                >
                                    <RotateCcw size={16} />
                                    Clear All Filters
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logo}>MEALMATRIX</div>
                <div style={styles.location}>
                    <MapPin size={14} color="#ef4444" />
                    <span>Bengaluru</span>
                </div>
            </div>

            {/* Search Bar */}
            <div style={styles.searchWrapper}>
                <div style={styles.searchContainer}>
                    <Search size={16} color="#888" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search dishes, restaurants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchInput}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            style={styles.clearSearch}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <div style={styles.filterLeft}>
                    {isMobile ? (
                        <button 
                            onClick={() => setShowMobileFilters(true)}
                            style={styles.mobileFilterToggle}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                            {hasActiveFilters && <span style={styles.filterDot} />}
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    ...styles.filterToggle,
                                    background: showFilters ? 'rgba(239,68,68,0.1)' : 'transparent',
                                    color: showFilters ? '#ef4444' : '#888'
                                }}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {hasActiveFilters && <span style={styles.filterDot} />}
                            </button>
                            
                            <div style={styles.sortWrapper}>
                                {sortOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        style={{
                                            ...styles.sortOption,
                                            background: sortBy === option.value ? 'rgba(239,68,68,0.1)' : 'transparent',
                                            color: sortBy === option.value ? '#ef4444' : '#888',
                                            borderColor: sortBy === option.value ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div style={styles.filterRight}>
                    <span style={styles.itemCount}>
                        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
            </div>

            {/* Categories with Scroll */}
            <div style={styles.categoriesSection}>
                <div style={styles.categoriesHeader}>
                    <h2 style={styles.categoriesTitle}>Categories</h2>
                    <div style={styles.categoryScrollButtons}>
                        <button 
                            onClick={() => scrollCategories('left')}
                            style={styles.scrollButton}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => scrollCategories('right')}
                            style={styles.scrollButton}
                        >
                            <ChevronRightIcon size={16} />
                        </button>
                    </div>
                </div>
                
                <div 
                    ref={categoryScrollRef}
                    style={styles.categoriesScrollContainer}
                >
                    {categories.map((category) => (
                        <motion.div
                            key={category.name}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(category.name)}
                            style={{
                                ...styles.categoryCard,
                                borderColor: selectedCategory === category.name ? category.color : 'rgba(255,255,255,0.05)',
                                background: selectedCategory === category.name ? `rgba(${category.color === '#ef4444' ? '239,68,68' : '139,92,246'},0.1)` : 'rgba(255,255,255,0.02)',
                            }}
                        >
                            <div style={styles.categoryImageWrapper}>
                                <img 
                                    src={category.img} 
                                    alt={category.name}
                                    style={styles.categoryImage}
                                />
                            </div>
                            <div style={styles.categoryInfo}>
                                <span style={styles.categoryName}>{category.name}</span>
                                <span style={styles.categoryCount}>
                                    {getCategoryCount(category.name)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Menu Items Grid */}
            <div style={styles.menuGrid}>
                {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={styles.menuCard}
                        >
                            <div style={styles.cardImageWrapper}>
                                <img 
                                    src={item.img} 
                                    alt={item.name}
                                    style={styles.cardImage}
                                />
                                <div style={styles.cardBadges}>
                                    {item.spicy && (
                                        <span style={styles.spicyBadge}>🌶️ Spicy</span>
                                    )}
                                    {item.rating >= 4.5 && (
                                        <span style={styles.hotBadge}>🔥 Bestseller</span>
                                    )}
                                </div>
                                <div style={styles.prepTime}>
                                    <Clock size={10} />
                                    {item.prepTime || '20-30 min'}
                                </div>
                            </div>

                            <div style={styles.cardContent}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.itemName}>{item.name}</h3>
                                    <div style={styles.ratingContainer}>
                                        <Star size={10} color="#fbbf24" fill="#fbbf24" />
                                        <span style={styles.rating}>{item.rating || 4.0}</span>
                                        <span style={styles.orders}>({item.orders || 100}+)</span>
                                    </div>
                                </div>

                                <p style={styles.itemDescription}>{item.description}</p>

                                <div style={styles.cardFooter}>
                                    <div style={styles.priceContainer}>
                                        <span style={styles.currency}>₹</span>
                                        <span style={styles.price}>{item.price}</span>
                                    </div>
                                    
                                    <button 
                                        style={styles.addToCartBtn}
                                        onClick={() => addToCart({ 
                                            id: item._id, 
                                            name: item.name, 
                                            price: item.price, 
                                            img: item.img,
                                            isVeg: item.isVeg,
                                            category: item.category
                                        })}
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Veg/Non-veg Badge with Icons - Top Right Position */}
                                <div style={{
                                    position: 'absolute',
                                    top: '25px',
                                    right: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: item.isVeg ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                    padding: '4px 8px',
                                    borderRadius: '20px',
                                    border: item.isVeg ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                                    backdropFilter: 'blur(4px)',
                                    zIndex: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}>
                                    {item.isVeg ? (
                                        <Leaf size={12} color="#22c55e" />
                                    ) : (
                                        <Beef size={12} color="#ef4444" />
                                    )}
                                    <span style={{ 
                                        fontSize: '10px', 
                                        fontWeight: '600', 
                                        color: item.isVeg ? '#22c55e' : '#ef4444',
                                        lineHeight: 1,
                                    }}>
                                        {item.isVeg ? 'Veg' : 'Non-veg'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={styles.noResults}>
                        <div style={styles.noResultsIcon}>🔍</div>
                        <h3 style={styles.noResultsTitle}>No items found</h3>
                        <p style={styles.noResultsText}>
                            Try adjusting your filters
                        </p>
                        <button 
                            onClick={clearAllFilters}
                            style={styles.clearFiltersBtn}
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                input[type=range] {
                    -webkit-appearance: none;
                    height: 4px;
                    background: rgba(239,68,68,0.2);
                    border-radius: 2px;
                    outline: none;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #ef4444;
                    border-radius: 50%;
                    cursor: pointer;
                }
                @media (max-width: 768px) {
                    input[type=range]::-webkit-slider-thumb {
                        width: 20px;
                        height: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: '#07070a',
        color: '#fff',
        fontFamily: "'Outfit', sans-serif",
        paddingBottom: '60px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        '@media (max-width: 768px)': {
            padding: '14px 16px',
        },
        '@media (max-width: 480px)': {
            padding: '12px',
        },
    },
    logo: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#ef4444',
        letterSpacing: '-0.5px',
        '@media (max-width: 480px)': {
            fontSize: '18px',
        },
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        color: '#888',
    },
    searchWrapper: {
        padding: '16px 20px 8px',
        '@media (max-width: 768px)': {
            padding: '14px 16px 8px',
        },
        '@media (max-width: 480px)': {
            padding: '12px 12px 6px',
        },
    },
    searchContainer: {
        position: 'relative',
        width: '100%',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
    },
    searchInput: {
        width: '100%',
        padding: '12px 12px 12px 40px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '30px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        '@media (max-width: 768px)': {
            padding: '10px 10px 10px 36px',
            fontSize: '13px',
        },
        '@media (max-width: 480px)': {
            padding: '8px 8px 8px 32px',
            fontSize: '12px',
        },
    },
    clearSearch: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.05)',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        cursor: 'pointer',
        '@media (max-width: 480px)': {
            width: '20px',
            height: '20px',
            right: '8px',
        },
    },
    filterBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px 20px',
        '@media (max-width: 768px)': {
            padding: '0 16px 16px',
        },
        '@media (max-width: 480px)': {
            padding: '0 12px 12px',
        },
    },
    filterLeft: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    filterToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '30px',
        color: '#888',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        position: 'relative',
        '@media (max-width: 768px)': {
            padding: '6px 14px',
            fontSize: '12px',
        },
    },
    filterDot: {
        position: 'absolute',
        top: '-2px',
        right: '-2px',
        width: '8px',
        height: '8px',
        background: '#ef4444',
        borderRadius: '50%',
        border: '2px solid #07070a',
    },
    sortWrapper: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    sortOption: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '30px',
        color: '#888',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        '@media (max-width: 768px)': {
            padding: '5px 10px',
            fontSize: '11px',
        },
    },
    mobileFilterToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '30px',
        color: '#ef4444',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        position: 'relative',
        '@media (max-width: 480px)': {
            padding: '6px 12px',
            fontSize: '12px',
        },
    },
    filterRight: {
        color: '#888',
        fontSize: '13px',
        '@media (max-width: 480px)': {
            fontSize: '12px',
        },
    },
    itemCount: {
        fontWeight: '600',
        background: 'rgba(255,255,255,0.05)',
        padding: '4px 10px',
        borderRadius: '20px',
    },
    categoriesSection: {
        padding: '0 20px',
        marginBottom: '30px',
        '@media (max-width: 768px)': {
            padding: '0 16px',
            marginBottom: '25px',
        },
        '@media (max-width: 480px)': {
            padding: '0 12px',
            marginBottom: '20px',
        },
    },
    categoriesHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
    },
    categoriesTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#fff',
        '@media (max-width: 480px)': {
            fontSize: '16px',
        },
    },
    categoryScrollButtons: {
        display: 'flex',
        gap: '8px',
    },
    scrollButton: {
        width: '32px',
        height: '32px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        cursor: 'pointer',
        '@media (max-width: 480px)': {
            width: '28px',
            height: '28px',
        },
    },
    categoriesScrollContainer: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        padding: '4px 2px 12px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    categoryCard: {
        minWidth: '120px',
        maxWidth: '140px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
        flexShrink: 0,
        '@media (max-width: 768px)': {
            minWidth: '100px',
        },
        '@media (max-width: 480px)': {
            minWidth: '90px',
        },
    },
    categoryImageWrapper: {
        height: '80px',
        overflow: 'hidden',
        '@media (max-width: 768px)': {
            height: '70px',
        },
        '@media (max-width: 480px)': {
            height: '60px',
        },
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    categoryInfo: {
        padding: '8px',
        textAlign: 'center',
        '@media (max-width: 480px)': {
            padding: '6px',
        },
    },
    categoryName: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#fff',
        marginBottom: '2px',
        '@media (max-width: 480px)': {
            fontSize: '12px',
        },
    },
    categoryCount: {
        fontSize: '11px',
        color: '#888',
        '@media (max-width: 480px)': {
            fontSize: '10px',
        },
    },
    menuGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px',
        padding: '0 20px',
        '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
        '@media (max-width: 768px)': {
            gap: '14px',
            padding: '0 16px',
        },
        '@media (max-width: 480px)': {
            gap: '12px',
            padding: '0 12px',
        },
    },
    menuCard: {
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: '12px',
        padding: '12px',
        position: 'relative',
        '@media (min-width: 1024px)': {
            padding: '16px',
            gap: '16px',
        },
        '@media (max-width: 768px)': {
            gap: '10px',
            padding: '10px',
        },
        '@media (max-width: 480px)': {
            gap: '8px',
            padding: '8px',
        },
    },
    cardImageWrapper: {
        position: 'relative',
        width: '100px',
        height: '100px',
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
        '@media (min-width: 1024px)': {
            width: '120px',
            height: '120px',
        },
        '@media (max-width: 768px)': {
            width: '90px',
            height: '90px',
        },
        '@media (max-width: 480px)': {
            width: '80px',
            height: '80px',
        },
    },
    cardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    cardBadges: {
        position: 'absolute',
        top: '6px',
        left: '6px',
        display: 'flex',
        gap: '4px',
        zIndex: 1,
    },
    spicyBadge: {
        padding: '2px 6px',
        background: 'rgba(239,68,68,0.2)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '12px',
        fontSize: '9px',
        fontWeight: '600',
        color: '#ef4444',
        '@media (min-width: 1024px)': {
            fontSize: '10px',
            padding: '3px 8px',
        },
        '@media (max-width: 480px)': {
            fontSize: '8px',
            padding: '2px 4px',
        },
    },
    hotBadge: {
        padding: '2px 6px',
        background: 'rgba(245,158,11,0.2)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: '12px',
        fontSize: '9px',
        fontWeight: '600',
        color: '#f59e0b',
        '@media (min-width: 1024px)': {
            fontSize: '10px',
            padding: '3px 8px',
        },
        '@media (max-width: 480px)': {
            fontSize: '8px',
            padding: '2px 4px',
        },
    },
    prepTime: {
        position: 'absolute',
        bottom: '6px',
        left: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '2px 6px',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: '12px',
        fontSize: '9px',
        color: '#fff',
        '@media (min-width: 1024px)': {
            fontSize: '10px',
            padding: '3px 8px',
        },
        '@media (max-width: 480px)': {
            fontSize: '8px',
            padding: '2px 4px',
        },
    },
    cardContent: {
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '6px',
        flexWrap: 'nowrap',
    },
    itemName: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#fff',
        margin: 0,
        lineHeight: 1.3,
        flex: 1,
        wordBreak: 'break-word',
        '@media (min-width: 1024px)': {
            fontSize: '18px',
        },
        '@media (max-width: 768px)': {
            fontSize: '14px',
        },
        '@media (max-width: 480px)': {
            fontSize: '13px',
        },
    },
    ratingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: 'rgba(0,0,0,0.3)',
        padding: '2px 6px',
        borderRadius: '12px',
        flexShrink: 0,
        '@media (min-width: 1024px)': {
            padding: '4px 8px',
            gap: '4px',
        },
        '@media (max-width: 480px)': {
            padding: '2px 4px',
        },
    },
    rating: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#fff',
        '@media (min-width: 1024px)': {
            fontSize: '13px',
        },
        '@media (max-width: 480px)': {
            fontSize: '10px',
        },
    },
    orders: {
        fontSize: '9px',
        color: '#888',
        '@media (min-width: 1024px)': {
            fontSize: '11px',
        },
        '@media (max-width: 480px)': {
            fontSize: '8px',
        },
    },
    itemDescription: {
        fontSize: '11px',
        color: '#888',
        lineHeight: '1.4',
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        wordBreak: 'break-word',
        '@media (min-width: 1024px)': {
            fontSize: '13px',
        },
        '@media (max-width: 768px)': {
            fontSize: '10px',
        },
        '@media (max-width: 480px)': {
            fontSize: '9px',
        },
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    priceContainer: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '1px',
    },
    currency: {
        fontSize: '11px',
        color: '#888',
        '@media (min-width: 1024px)': {
            fontSize: '14px',
        },
        '@media (max-width: 480px)': {
            fontSize: '10px',
        },
    },
    price: {
        fontSize: '16px',
        fontWeight: '800',
        color: '#fff',
        '@media (min-width: 1024px)': {
            fontSize: '20px',
        },
        '@media (max-width: 768px)': {
            fontSize: '15px',
        },
        '@media (max-width: 480px)': {
            fontSize: '14px',
        },
    },
    addToCartBtn: {
        padding: '8px 24px',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        border: 'none',
        borderRadius: '30px',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        minWidth: '80px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
        letterSpacing: '0.3px',
        '@media (min-width: 1024px)': {
            padding: '10px 32px',
            fontSize: '16px',
            minWidth: '100px',
        },
        '@media (max-width: 768px)': {
            padding: '6px 16px',
            fontSize: '13px',
            minWidth: '70px',
        },
        '@media (max-width: 480px)': {
            padding: '5px 12px',
            fontSize: '12px',
            minWidth: '60px',
        },
    },
    noResults: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '60px 20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
    },
    noResultsIcon: {
        fontSize: '48px',
        marginBottom: '16px',
        opacity: 0.5,
    },
    noResultsTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#fff',
        marginBottom: '8px',
    },
    noResultsText: {
        fontSize: '14px',
        color: '#888',
        marginBottom: '20px',
    },
    clearFiltersBtn: {
        padding: '10px 24px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '30px',
        color: '#ef4444',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            background: 'rgba(239,68,68,0.2)',
        },
    },
    // Mobile Filters
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(5px)',
        zIndex: 1999,
    },
    mobileFilters: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#111',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '20px',
        zIndex: 2000,
        maxHeight: '80vh',
        overflowY: 'auto',
    },
    mobileFiltersHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    mobileFiltersTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#fff',
    },
    closeModalBtn: {
        width: '36px',
        height: '36px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px',
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    mobileFiltersContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    mobileFilterSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    filterLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    mobileSelect: {
        width: '100%',
        padding: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    mobilePriceRange: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#fff',
    },
    priceValue: {
        minWidth: '45px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: '600',
        color: '#ef4444',
    },
    rangeInput: {
        flex: 1,
        height: '4px',
    },
    pricePresets: {
        display: 'flex',
        gap: '8px',
        marginTop: '5px',
        '& button': {
            flex: 1,
            padding: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            color: '#888',
            fontSize: '11px',
            cursor: 'pointer',
        }
    },
    dietOptions: {
        display: 'flex',
        gap: '10px',
    },
    dietButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    clearAllBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '14px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '12px',
        color: '#ef4444',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
    },
};

export default MenuPage;