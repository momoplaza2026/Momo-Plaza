import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ADDR = encodeURIComponent(
  '709 (8, 136/4/2, Pashupati Bhattacharya Rd, East Behala, Green Park, Sarada Pally, Kolkata, West Bengal 700034'
);
const MAP_SRC = `https://maps.google.com/maps?q=${ADDR}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

const FEATURES = [
  { icon: '🌿', label: 'Fresh Ingredients' },
  { icon: '💨', label: 'Steamed to Perfection' },
  { icon: '❤️', label: 'Made with Love' },
  { icon: '🌶️', label: 'Bengali Spices' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const Hero = () => {
  const [bgOffset, setBgOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setBgOffset(window.scrollY * 0.35);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        .hero-grid {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          width: 100%;
          padding: 6rem 1.5rem 6rem;
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            flex-direction: row;
            align-items: center;
            gap: 3rem;
            padding: 6rem 3rem 4rem;
          }
        }
        .hero-left { flex: 1; display: flex; flex-direction: column; gap: 1.4rem; }
        .hero-right {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        @media (min-width: 1024px) {
          .hero-right { width: 400px; flex-shrink: 0; }
        }
        .momo-img-mobile { display: block; }
        .momo-img-desktop { display: none; }
        @media (min-width: 1024px) {
          .momo-img-mobile { display: none; }
          .momo-img-desktop { display: block; }
        }
        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: clamp(4rem, 11vw, 8rem);
          line-height: 0.88;
          letter-spacing: -0.03em;
          color: #fff;
          text-shadow: 0 4px 40px rgba(0,0,0,0.6);
        }
        .hero-title span {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 45%, #dc2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <section id="home" style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#060200',
        display: 'flex',
        alignItems: 'center',
      }}>

        {/* ── PARALLAX BACKGROUND IMAGE ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          <img
            src="/momo_bg.png"
            alt=""
            style={{
              width: '100%',
              height: '115%',
              objectFit: 'cover',
              objectPosition: 'center',
              position: 'absolute',
              top: `-7.5%`,
              left: 0,
              transform: `translateY(${bgOffset}px)`,
              willChange: 'transform',
            }}
          />
          {/* Dark overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,2,0,0.6) 0%, rgba(6,2,0,0.4) 40%, rgba(6,2,0,0.92) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,2,0,0.75) 0%, rgba(6,2,0,0.15) 55%, rgba(6,2,0,0.5) 100%)' }} />
        </div>

        {/* ── FLOATING PARTICLES ── */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(220,38,38,0.12)',
              width: `${35 + i * 12}px`,
              height: `${35 + i * 12}px`,
              left: `${(i * 13) % 95}%`,
              bottom: `${15 + (i * 9) % 40}%`,
              filter: 'blur(16px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            animate={{ y: [0, -(70 + i * 18), 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 5 + i * 0.9, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
          />
        ))}

        {/* ── CONTENT GRID ── */}
        <div className="hero-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="hero-left">

            {/* Badge */}
            <motion.div {...fadeUp(0.2)} style={{ display: 'flex' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.45rem 1.2rem', borderRadius: '999px',
                border: '1px solid rgba(245,158,11,0.5)',
                background: 'rgba(245,158,11,0.12)',
                color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem',
                textTransform: 'uppercase', letterSpacing: '0.18em',
                boxShadow: '0 0 24px rgba(245,158,11,0.2)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#f59e0b', display: 'inline-block',
                  boxShadow: '0 0 8px #f59e0b',
                }} />
                Snack Happy, Stay Happy!
              </span>
            </motion.div>

            {/* Title */}
            <motion.div {...fadeUp(0.32)}>
              <h1 className="hero-title">
                MOMO<br /><span>PLAZA</span>
              </h1>
            </motion.div>

            {/* Divider + tagline */}
            <motion.div {...fadeUp(0.48)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', maxWidth: 400 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #f59e0b, transparent)' }} />
              <span style={{
                color: 'rgba(245,158,11,0.9)', fontWeight: 700,
                fontSize: 'clamp(0.65rem, 1.4vw, 0.85rem)',
                textTransform: 'uppercase', letterSpacing: '0.18em', whiteSpace: 'nowrap',
              }}>Authentic Momo. Bengali Soul.</span>
            </motion.div>

            {/* Bengali quote */}
            <motion.p {...fadeUp(0.58)} style={{
              color: 'rgba(255,237,213,0.72)', fontStyle: 'italic',
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.75, maxWidth: 400,
            }}>
              "পাহাড়ের স্বাদ, বাংলার মনের টান,<br />এক কামড়ে উৎসব!"
            </motion.p>

            {/* Feature pills */}
            <motion.div {...fadeUp(0.68)} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {FEATURES.map(f => (
                <span key={f.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.9rem', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,237,213,0.8)', fontWeight: 500, fontSize: '0.78rem',
                }}>{f.icon} {f.label}</span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.78)} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem' }}>
              <motion.a
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(245,158,11,0.55)' }}
                whileTap={{ scale: 0.97 }}
                href="#menu"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                  padding: '0.8rem 1.8rem', borderRadius: '999px',
                  textDecoration: 'none', boxShadow: '0 8px 28px rgba(245,158,11,0.35)',
                }}
              >
                🥟 View Menu
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.13)' }}
                whileTap={{ scale: 0.97 }}
                href="#map"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  padding: '0.8rem 1.8rem', borderRadius: '999px',
                  textDecoration: 'none',
                }}
              >📍 Find Us</motion.a>
            </motion.div>

            {/* Momo image — mobile only */}
            <motion.div
              className="momo-img-mobile"
              initial={{ opacity: 0, scale: 0.88, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.1, delay: 0.5, type: 'spring', stiffness: 50 }}
              style={{ position: 'relative', width: '100%', maxWidth: 360, margin: '1rem auto 0' }}
            >
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 22,
                background: 'linear-gradient(135deg,rgba(245,158,11,0.45),rgba(220,38,38,0.25))',
                filter: 'blur(26px)', transform: 'scale(1.08)',
              }} />
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                src="/hero_momo.png" alt="Steaming momos"
                style={{
                  position: 'relative', zIndex: 1, width: '100%', borderRadius: 22,
                  boxShadow: '0 28px 64px rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, type: 'spring' }}
                style={{ position: 'absolute', top: -12, right: -12, zIndex: 2, background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '0.72rem', padding: '0.35rem 0.75rem', borderRadius: 10, transform: 'rotate(6deg)', boxShadow: '0 4px 12px rgba(220,38,38,0.5)' }}
              >🍃 Fresh!</motion.div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring' }}
                style={{ position: 'absolute', bottom: -12, left: -12, zIndex: 2, background: '#f59e0b', color: '#060200', fontWeight: 800, fontSize: '0.72rem', padding: '0.35rem 0.75rem', borderRadius: 10, transform: 'rotate(-5deg)', boxShadow: '0 4px 12px rgba(245,158,11,0.5)' }}
              >🥟 From ₹40!</motion.div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 50 }}
          >
            {/* Momo image — desktop only */}
            <div className="momo-img-desktop" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 24,
                background: 'linear-gradient(135deg,rgba(245,158,11,0.5),rgba(220,38,38,0.28))',
                filter: 'blur(28px)', transform: 'scale(1.08)',
              }} />
              <motion.img
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                src="/hero_momo.png" alt="Steaming momos"
                style={{
                  position: 'relative', zIndex: 1, width: '100%',
                  borderRadius: 24, boxShadow: '0 28px 72px rgba(0,0,0,0.82)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  maxHeight: 250, objectFit: 'cover', objectPosition: 'center',
                  display: 'block',
                }}
              />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}
                style={{ position: 'absolute', top: -12, right: -12, zIndex: 2, background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '0.75rem', padding: '0.38rem 0.82rem', borderRadius: 11, transform: 'rotate(6deg)', boxShadow: '0 4px 12px rgba(220,38,38,0.55)' }}
              >🍃 Fresh!</motion.div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.45, type: 'spring' }}
                style={{ position: 'absolute', bottom: -12, left: -12, zIndex: 2, background: '#f59e0b', color: '#060200', fontWeight: 800, fontSize: '0.75rem', padding: '0.38rem 0.82rem', borderRadius: 11, transform: 'rotate(-5deg)', boxShadow: '0 4px 12px rgba(245,158,11,0.55)' }}
              >🥟 From ₹40!</motion.div>
            </div>

            {/* ── MAP CARD ── */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              overflow: 'hidden',
              maxWidth: 420,
              margin: '0 auto',
            }}>
              {/* Map embed */}
              <div style={{ position: 'relative', height: 200 }}>
                <iframe
                  title="Momo Plaza Map"
                  src={MAP_SRC}
                  style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              {/* Card footer */}
              <div style={{
                padding: '0.9rem 1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem',
              }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', marginBottom: 2 }}>
                    📍 East Behala, Kolkata 700034
                  </p>
                  <p style={{ color: 'rgba(255,237,213,0.45)', fontSize: '0.7rem' }}>
                    Pashupati Bhattacharya Rd
                  </p>
                </div>
                <motion.a
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://maps.app.goo.gl/ybtTupzPbb54nTAv6"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
                    color: '#fff', fontWeight: 700, fontSize: '0.72rem',
                    padding: '0.42rem 0.9rem', borderRadius: 999,
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
                  }}
                >Open ↗</motion.a>
              </div>
            </div>

            {/* Dine-in pills */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['🍽 Dine In', '🥡 Take Away', '🛵 Delivery'].map(m => (
                <span key={m} style={{
                  padding: '0.4rem 0.9rem', borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,237,213,0.7)', fontWeight: 600, fontSize: '0.78rem',
                }}>{m}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── SCROLL INDICATOR ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          style={{
            position: 'absolute', bottom: '1.8rem', left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 20, height: 33, borderRadius: 10,
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', justifyContent: 'center', paddingTop: 5,
            }}
          >
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b' }} />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
