import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Home', href: '#home' },
    { label: 'Menu', href: '#menu' },
    { label: 'Find Us', href: '#map' },
  ];

  return (
    <>
      <style>{`
        .desktop-nav { display: none !important; }
        .mobile-hamburger { display: flex !important; }
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          padding: '0 1.5rem',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease',
          background: scrolled ? 'rgba(6,2,0,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 2px 30px rgba(0,0,0,0.5)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(245,158,11,0.1)' : 'none',
        }}
      >
        {/* Logo */}
        <motion.a
          href="#home"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <img
            src="/logo.png"
            alt="Momo Plaza Logo"
            style={{
              height: scrolled ? '54px' : '64px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.5))',
              transition: 'height 0.3s ease',
            }}
          />
        </motion.a>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ alignItems: 'center', gap: '2rem' }}>
          {links.map(l => (
            <a key={l.label} href={l.href} style={{
              color: 'rgba(255,237,213,0.75)', fontWeight: 600, fontSize: '0.85rem',
              textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#f59e0b'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,237,213,0.75)'}
            >{l.label}</a>
          ))}
          <motion.a
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            href="https://instagram.com/momo.plaza" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              padding: '0.5rem 1.2rem', borderRadius: '999px',
              textDecoration: 'none', boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
            }}
          >📸 @momo.plaza</motion.a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="mobile-hamburger"
          style={{
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 8, padding: '0.5rem 0.7rem', color: '#f59e0b',
            cursor: 'pointer', fontSize: '1.2rem',
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999,
              background: 'rgba(6,2,0,0.97)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(245,158,11,0.15)',
              padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1rem',
            }}
          >
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{
                  color: '#ffedd5', fontWeight: 700, fontSize: '1.1rem',
                  textDecoration: 'none', padding: '0.6rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >{l.label}</a>
            ))}
            <a href="https://instagram.com/momo.plaza" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                padding: '0.75rem 1.5rem', borderRadius: '999px',
                textDecoration: 'none', marginTop: '0.5rem',
              }}
            >📸 Follow @momo.plaza</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
