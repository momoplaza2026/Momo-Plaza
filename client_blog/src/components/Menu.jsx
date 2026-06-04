import React from 'react';
import { motion } from 'framer-motion';

const MENU = [
  {
    id: 1,
    name: 'Juicy Chicken Steam Momo',
    desc: 'Soft, juicy & perfectly steamed to perfection.',
    price: 50,
    pcs: 5,
    emoji: '🍗',
    color: '#f59e0b',
    tag: 'Best Seller',
  },
  {
    id: 2,
    name: 'Chicken Gondhoraj Momo',
    desc: 'Zesty gondhoraj flavor with a citrusy twist.',
    price: 70,
    pcs: 5,
    emoji: '🍋',
    color: '#84cc16',
    tag: 'Chef\'s Pick',
  },
  {
    id: 3,
    name: 'Veg Momo',
    desc: 'Healthy & delicious vegetable stuffed momo.',
    price: 40,
    pcs: 5,
    emoji: '🥬',
    color: '#22c55e',
    tag: 'Pure Veg',
  },
  {
    id: 4,
    name: 'Chicken Cheese Corn Momo',
    desc: 'Cheesy, corny & utterly irresistible!',
    price: 80,
    pcs: 5,
    emoji: '🧀',
    color: '#fb923c',
    tag: 'Fan Favourite',
  },
  {
    id: 5,
    name: 'Chicken Fried Momo',
    desc: 'Crispy outside, juicy inside!',
    price: 100,
    pcs: 5,
    emoji: '🔥',
    color: '#dc2626',
    tag: 'Crispy & Hot',
  },
];

const CHUTNEYS = [
  { name: 'Spicy Red Chutney', color: '#dc2626', emoji: '🌶️' },
  { name: 'Creamy Mayonnaise', color: '#fbbf24', emoji: '🥣' },
  { name: 'Coriander Green', color: '#22c55e', emoji: '🌿' },
  { name: 'Tangy Momo Chutney', color: '#f97316', emoji: '🍊' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Menu = () => {
  return (
    <section id="menu" style={{
      position: 'relative', width: '100%',
      backgroundColor: '#060200', overflow: 'hidden',
      padding: '6rem 1.5rem',
    }}>

      {/* Background: menu_bg image subtle */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/menu_bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.07,
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom,#060200 0%, transparent 15%, transparent 85%, #060200 100%)',
      }} />
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: '50%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 900, margin: '0 auto' }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <span style={{
            display: 'inline-block',
            padding: '0.3rem 1.1rem', borderRadius: '999px',
            border: '1px solid rgba(245,158,11,0.35)',
            background: 'rgba(245,158,11,0.08)',
            color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem',
            textTransform: 'uppercase', letterSpacing: '0.18em',
            marginBottom: '1.2rem',
          }}>Hot. Tasty. Irresistible!</span>

          <h2 style={{
            fontFamily: 'Outfit,sans-serif', fontWeight: 900,
            fontSize: 'clamp(2.8rem,7vw,5rem)',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg,#fff 30%,#f59e0b 70%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
          }}>OUR MENU</h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ flex: 1, maxWidth: 80, height: 2, background: 'linear-gradient(to right,transparent,#dc2626)' }} />
            <span style={{ fontSize: '1.4rem' }}>🥟</span>
            <div style={{ flex: 1, maxWidth: 80, height: 2, background: 'linear-gradient(to left,transparent,#dc2626)' }} />
          </div>
          <p style={{ color: 'rgba(255,237,213,0.55)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Each serving — 5 pieces
          </p>
        </motion.div>

        {/* Menu cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {MENU.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ scale: 1.02, y: -3 }}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.2rem',
                padding: '1.4rem 1.5rem',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'default',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${item.color}55`;
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${item.color}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
              }}
            >
              {/* Left color bar */}
              <div style={{
                position: 'absolute', left: 0, top: '15%', bottom: '15%',
                width: 3, borderRadius: 4, background: item.color,
                boxShadow: `0 0 12px ${item.color}70`,
              }} />

              {/* Emoji icon */}
              <motion.div
                whileHover={{ rotate: 15, scale: 1.15 }}
                style={{
                  fontSize: '2.5rem',
                  width: 62, height: 62, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${item.color}22, ${item.color}10)`,
                  border: `1px solid ${item.color}30`,
                  boxShadow: `0 4px 16px ${item.color}20`,
                }}
              >{item.emoji}</motion.div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <h3 style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 800,
                    fontSize: 'clamp(1rem,2.5vw,1.25rem)',
                    color: '#fff', letterSpacing: '-0.01em',
                  }}>{item.name}</h3>
                  <span style={{
                    padding: '0.15rem 0.6rem', borderRadius: 999,
                    background: `${item.color}20`, border: `1px solid ${item.color}40`,
                    color: item.color, fontWeight: 700, fontSize: '0.65rem',
                    textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                  }}>{item.tag}</span>
                </div>
                <p style={{ color: 'rgba(255,237,213,0.58)', fontSize: '0.85rem', lineHeight: 1.5 }}>{item.desc}</p>
                <span style={{
                  display: 'inline-block', marginTop: '0.5rem',
                  padding: '0.2rem 0.7rem', borderRadius: 999,
                  background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)',
                  color: '#fca5a5', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em',
                }}>🥟 {item.pcs} PCS</span>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                <div style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 900,
                  fontSize: 'clamp(2rem,5vw,3rem)',
                  background: `linear-gradient(135deg,${item.color},#fff)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}>₹{item.price}</div>
                <div style={{
                  color: 'rgba(255,237,213,0.4)', fontSize: '0.65rem',
                  fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                  marginTop: 4,
                }}>per plate</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chutney section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ marginTop: '3.5rem', textAlign: 'center' }}
        >
          <p style={{
            color: 'rgba(255,237,213,0.45)', fontWeight: 600, fontSize: '0.78rem',
            textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '1.2rem',
          }}>Served with your choice of chutney</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            {CHUTNEYS.map(c => (
              <motion.span
                key={c.name}
                whileHover={{ scale: 1.08, y: -3 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.1rem', borderRadius: 999,
                  background: `${c.color}14`, border: `1px solid ${c.color}35`,
                  color: 'rgba(255,237,213,0.8)', fontWeight: 600, fontSize: '0.8rem',
                  cursor: 'default',
                }}
              >{c.emoji} {c.name}</motion.span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Menu;
