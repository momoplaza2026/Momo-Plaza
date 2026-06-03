import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Utensils, ChevronLeft, ChevronRight, Clock, MapPin, Award, Flame, ChefHat, Bike } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// ── Momos-Only Banner ──────────────────────────────────────────────────────
const MomosOnlyBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{
          position: 'relative',
          marginBottom: '28px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(120deg, rgba(239,68,68,0.12) 0%, rgba(234,179,8,0.08) 60%, rgba(239,68,68,0.06) 100%)',
          border: '1px solid rgba(239,68,68,0.35)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 8px 32px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: 'clamp(14px, 3vw, 22px) clamp(16px, 4vw, 28px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 20px)',
          flexWrap: 'wrap',
        }}
      >
        {/* Ambient glow blob */}
        <motion.div
          animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: '-40px',
            top: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />

        {/* Momo Image Icon */}
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            flexShrink: 0,
            width: 'clamp(64px, 12vw, 90px)',
            height: 'clamp(64px, 12vw, 90px)',
            position: 'relative',
          }}
        >
          <img
            src="/banner_momo.png"
            alt="Steaming Momo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.55)) drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
            }}
          />
        </motion.div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: '180px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444',
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 'clamp(9px, 2.5vw, 11px)',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#ef4444',
            }}>
              Early Access Notice
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: 'clamp(13px, 3.5vw, 15px)',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.5,
          }}>
            🎉 We're just getting started! <span style={{ color: '#fbbf24' }}>Only Momos</span> are available right now — more dishes are coming <span style={{ color: '#ef4444' }}>very soon!</span>
          </p>
        </div>

        {/* Dismiss button */}
        <motion.button
          whileHover={{ scale: 1.12, background: 'rgba(239,68,68,0.18)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setVisible(false)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)',
            borderRadius: '12px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            flexShrink: 0,
            transition: 'all 0.2s',
            position: 'relative',
            zIndex: 1,
          }}
          aria-label="Dismiss banner"
        >
          ✕
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

// Loader Component - Momo Photo with Steam Animation
const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0a0f 60%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Background ambient glow - red + gold */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, rgba(234,179,8,0.08) 50%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* Brand logo with float + pulse glow + spinning rings */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            {/* Pulsing glow disc behind logo */}
            <motion.div
              animate={{
                opacity: [0.4, 0.9, 0.4],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '230px', height: '230px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,38,38,0.5) 0%, rgba(220,38,38,0) 70%)',
                filter: 'blur(20px)',
                zIndex: 0
              }}
            />

            {/* Main logo circle */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px rgba(220,38,38,0), 0 20px 40px rgba(0,0,0,0.6)',
                  '0 0 50px rgba(220,38,38,0.7), 0 0 100px rgba(220,38,38,0.25), 0 20px 40px rgba(0,0,0,0.6)',
                  '0 0 0px rgba(220,38,38,0), 0 20px 40px rgba(0,0,0,0.6)'
                ]
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                background: '#000'
              }}
            >
              <img
                src="/brand_logo.jpg"
                alt="Momo Plaza"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
              {/* Gold sheen sweep */}
              <motion.div
                animate={{ x: ['-130%', '230%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '32%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
                  transform: 'skewX(-15deg)',
                  zIndex: 2
                }}
              />
            </motion.div>

            {/* Fast spinning red ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', zIndex: 3,
                top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
                borderRadius: '50%',
                border: '2.5px solid transparent',
                borderTopColor: '#ef4444',
                borderRightColor: 'rgba(239,68,68,0.2)',
                borderBottomColor: 'transparent',
                borderLeftColor: 'rgba(239,68,68,0.05)'
              }}
            />
            {/* Slow spinning gold dashed ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', zIndex: 3,
                top: '-20px', left: '-20px', right: '-20px', bottom: '-20px',
                borderRadius: '50%',
                border: '1.5px dashed rgba(234,179,8,0.4)'
              }}
            />
            {/* Outermost pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute', zIndex: 0,
                top: '-28px', left: '-28px', right: '-28px', bottom: '-28px',
                borderRadius: '50%',
                border: '2px solid rgba(220,38,38,0.5)'
              }}
            />
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          style={{ color: 'rgba(255,215,0,0.6)', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}
        >
          HOT. TASTY. IRRESISTIBLE!
        </motion.p>

        {/* Animated loading bar */}
        <div style={{ width: '220px', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px', margin: '0 auto 12px', overflow: 'hidden' }}>
          <motion.div
            animate={{ x: ['-100%', '120%'] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              height: '100%', width: '55%',
              background: 'linear-gradient(90deg, transparent, #ef4444, #fbbf24, #ef4444, transparent)',
              borderRadius: '10px'
            }}
          />
        </div>

        <motion.p
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase' }}
        >
          Steaming fresh momos...
        </motion.p>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { userInfo } = useAuth();
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (userInfo && userInfo.isDriver) {
      navigate('/driver/dashboard');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/menu');
        // Ensure data is always an array
        setMenuItems(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setMenuItems([]);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-rotate hero content
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const categories = Array.isArray(menuItems) ? [
    { name: 'All', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', count: menuItems.length },
    { name: 'Starters', img: 'https://5.imimg.com/data5/SELLER/Default/2021/9/WK/YL/RM/125386639/chicken-popcorn-500x500.jpg', count: menuItems.filter(i => i.category === 'Starters').length },
    { name: 'Main Course', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', count: menuItems.filter(i => i.category === 'Main Course').length },
    { name: 'Chinese', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80', count: menuItems.filter(i => i.category === 'Chinese').length },
    { name: 'Beverages', img: 'https://vaya.in/careers/wp-content/uploads/2019/03/5-protein-drinks-and-beverages-to-have-post-work-out.jpg', count: menuItems.filter(i => i.category === 'Beverages').length },
    { name: 'Desserts', img: 'https://shop.chudleighs.com/cdn/shop/products/MoltenChocolateLavaCake_086_720x.jpg?v=1616096917', count: menuItems.filter(i => i.category === 'Desserts').length },
  ] : [];


  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Hero content array for animation - Momo themed
  const heroContents = [
    {
      title: "Steam Fresh Momos",
      subtitle: "Authentic Himalayan dumplings, steamed to perfection",
      badge: "STEAMED",
      description: "Juicy, handcrafted momos wrapped in love , delivered piping hot",
      img: '/hero_steam_momo.png'
    },
    {
      title: "Crispy Saucy Momos",
      subtitle: "Fried golden, drenched in our signature spicy sauce",
      badge: "SPICY",
      description: "That perfect crunch with a fiery kick you'll crave every day",
      img: '/hero_fried_momo.png'
    },
    {
      title: "Green Chutney Momos",
      subtitle: "Fresh herb-infused momos with zesty green chutney",
      badge: "FRESH",
      description: "A vibrant burst of freshness in every single bite",
      img: '/hero_green_momo.png'
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && <Loader />}
      </AnimatePresence>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
        {/* Animated Hero Section with Red Accents */}
        <section
          style={{
            position: "relative",
            borderRadius: "40px",
            overflow: "hidden",
            marginBottom: "40px",
            minHeight: "clamp(420px,60vh,550px)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Background - Animated Momo Image Carousel */}
          <AnimatePresence mode="sync">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
              }}
            >
              <img
                src={heroContents[heroIndex].img}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: 'center' }}
                alt="Momo Hero"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0.3) 100%)",
                }}
              />
              {/* Bottom vignette */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)'
              }} />
            </motion.div>
          </AnimatePresence>

          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{
              position: "absolute",
              top: "15%",
              right: "10%",
              zIndex: 1,
              color: "#ef4444",
              opacity: 0.2,
            }}
          >
            <Flame size={80} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            style={{
              position: "absolute",
              bottom: "20%",
              left: "8%",
              zIndex: 1,
              color: "#ef4444",
              opacity: 0.15,
            }}
          >
            <ChefHat size={70} />
          </motion.div>

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "clamp(20px,5vw,60px)",
              maxWidth: "700px",
            }}
          >
            {/* Badge */}
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: "20px" }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  backgroundColor: ["#ef4444", "#dc2626", "#ef4444"],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: "30px",
                  fontSize: "clamp(11px,2.5vw,14px)",
                  fontWeight: "700",
                  boxShadow: "0 0 20px rgba(239,68,68,0.5)",
                }}
              >
                🔥 {heroContents[heroIndex].badge} 🔥
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              key={heroIndex + "title"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                style={{
                  fontSize: "clamp(26px,7vw,72px)",
                  fontWeight: "900",
                  letterSpacing: "-1px",
                  lineHeight: "1.1",
                  marginBottom: "20px",
                }}
              >
                {heroContents[heroIndex].title.split(" ").map((word, i) =>
                  word === "Steam" || word === "Saucy" || word === "Green" ? (
                    <span key={i} style={{ color: "#ef4444" }}>
                      {" "}
                      {word}{" "}
                    </span>
                  ) : (
                    <span key={i}> {word} </span>
                  )
                )}
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "clamp(14px,3.5vw,20px)",
                marginBottom: "15px",
                lineHeight: "1.6",
              }}
            >
              {heroContents[heroIndex].subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "clamp(13px,3vw,16px)",
                marginBottom: "30px",
              }}
            >
              {heroContents[heroIndex].description}
            </motion.p>

            {/* Stats */}
            <motion.div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "clamp(15px,5vw,50px)",
                marginBottom: "30px",
              }}
            >
              {[
                { num: "50+", text: "Gourmet Dishes" },
                { num: "15k+", text: "Happy Customers" },
                { num: "30min", text: "Avg. Delivery" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  style={{ textAlign: "center" }}
                >
                  <div
                    style={{
                      fontSize: "clamp(20px,5vw,32px)",
                      fontWeight: "800",
                      color: "#ef4444",
                    }}
                  >
                    {item.num}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px,2.5vw,12px)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {item.text}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Feature Chips */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: <Clock size={14} />, text: "24/7 Delivery" },
                { icon: <MapPin size={14} />, text: "Track Order" },
                { icon: <Award size={14} />, text: "Premium Quality" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{
                    scale: 1.05,
                    background: "rgba(239,68,68,0.2)",
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255,255,255,0.1)",
                    padding: "6px 12px",
                    borderRadius: "30px",
                    fontSize: "clamp(10px,2.5vw,14px)",
                  }}
                >
                  <span style={{ color: "#ef4444" }}>{feature.icon}</span>
                  {feature.text}
                </motion.div>
              ))}
            </div>

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "30px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  style={{
                    width: "clamp(25px,6vw,40px)",
                    height: "4px",
                    borderRadius: "2px",
                    background:
                      heroIndex === i ? "#ef4444" : "rgba(255,255,255,0.2)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Momos-Only Announcement Banner ── */}
        <MomosOnlyBanner />

        {/* Modern Attractive Category Section */}
        <section style={{ marginBottom: '60px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', margin: '0 0 5px 0' }}
              >
                Explore <span style={{ color: '#ef4444' }}>Categories</span>
              </motion.h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Discover our curated selection of cuisines</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.2)', borderColor: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll('left')}
                className="glass"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.2)', borderColor: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll('right')}
                className="glass"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>

          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              padding: '5px 5px 30px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((cat, idx) => {
              const isActive = activeCategory === cat.name;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    minWidth: '180px',
                    height: '220px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '20px',
                    border: isActive ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                    boxShadow: isActive ? '0 10px 30px -10px #ef4444' : 'none'
                  }}
                >
                  <img
                    src={cat.img}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0,
                      filter: isActive ? 'brightness(0.7)' : 'brightness(0.5)',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.5s'
                    }}
                    alt={cat.name}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isActive
                      ? 'linear-gradient(to top, rgba(239,68,68,0.4), transparent)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    zIndex: 1
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      {cat.count} Items
                    </span>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: 'white',
                      margin: 0
                    }}>
                      {cat.name}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Menu Grid */}
        <section style={{ width: '100%', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'clamp(15px, 4vw, 30px)',
            padding: '0 clamp(8px, 3vw, 0)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{
                fontSize: 'clamp(20px, 6vw, 36px)',
                fontWeight: '800',
                margin: '0 0 3px 0',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                {activeCategory} <span style={{ color: '#ef4444', whiteSpace: 'nowrap' }}>Specials</span>
              </h2>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                margin: 0
              }}>
                {filteredItems.length} items available
              </p>
            </div>

            {/* Optional: Add view all button for mobile if needed */}
            {filteredItems.length > 4 && (
              <button style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: 'clamp(12px, 3vw, 14px)',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                View All →
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 45vw, 280px), 1fr))',
            gap: 'clamp(12px, 3vw, 20px)',
            padding: '0 clamp(8px, 2vw, 0)',
            width: '100%'
          }}>
            <AnimatePresence mode='popLayout'>
              {filteredItems.map(item => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item._id}
                  className="glass"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    overflow: 'hidden',
                    padding: 'clamp(10px, 3vw, 15px)',
                    borderRadius: 'clamp(15px, 4vw, 20px)',
                    width: '100%',
                    minWidth: 0 // Prevents overflow in flex/grid children
                  }}
                >
                  <div style={{
                    position: 'relative',
                    height: 'clamp(150px, 40vw, 200px)',
                    marginBottom: 'clamp(10px, 3vw, 15px)',
                    borderRadius: 'clamp(12px, 3vw, 15px)',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={item.img}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s',
                      }}
                      alt={item.name}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'clamp(5px, 2vw, 10px)',
                      right: 'clamp(5px, 2vw, 10px)',
                      display: 'flex',
                      gap: '5px',
                      zIndex: 2
                    }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: 'clamp(10px, 3vw, 12px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Star size={12} fill="#ffc107" color="#ffc107" />
                        {item.rating}
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: 'clamp(5px, 2vw, 10px)',
                      left: 'clamp(5px, 2vw, 10px)',
                      zIndex: 2
                    }}>
                      <div style={{
                        border: `2px solid ${item.isVeg ? '#10b981' : '#ef4444'}`,
                        width: 'clamp(14px, 4vw, 16px)',
                        height: 'clamp(14px, 4vw, 16px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white',
                        borderRadius: '3px'
                      }}>
                        <div style={{
                          background: item.isVeg ? '#10b981' : '#ef4444',
                          width: 'clamp(6px, 2vw, 8px)',
                          height: 'clamp(6px, 2vw, 8px)',
                          borderRadius: '50%'
                        }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginBottom: 'clamp(10px, 3vw, 15px)',
                    minWidth: 0 // Prevent text overflow
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(16px, 5vw, 18px)',
                      fontWeight: '700',
                      marginBottom: '5px',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'clamp(10px, 3vw, 12px)',
                      color: 'var(--text-muted)',
                      gap: '5px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '3px 8px',
                        borderRadius: '20px'
                      }}>
                        {item.category}
                      </span>
                      <span>{item.orders} orders</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: 'clamp(18px, 5vw, 22px)',
                      fontWeight: '800',
                      color: '#ef4444',
                      whiteSpace: 'nowrap'
                    }}>
                      ₹{item.price}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05, background: '#dc2626' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        img: item.img,
                        isVeg: item.isVeg,
                        category: item.category
                      })}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: 'clamp(6px, 2.5vw, 8px) clamp(10px, 4vw, 15px)',
                        borderRadius: 'clamp(10px, 3vw, 12px)',
                        fontSize: 'clamp(12px, 3.5vw, 13px)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap',
                        minWidth: 'min(80px, 30vw)',
                        justifyContent: 'center'
                      }}
                    >
                      <Utensils size={16} />
                      <span>Add</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state for no items */}
          {filteredItems.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '20px',
              margin: '20px 0'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                No items found in {activeCategory}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Home;