import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer style={{
      width: '100%', backgroundColor: '#030100',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '4rem 1.5rem 2rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top gold line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: 1,
        background: 'linear-gradient(to right,transparent,#f59e0b60,transparent)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr',
          gap: '2.5rem', marginBottom: '3rem',
        }}
          className="md:grid-cols-3"
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <img
                src="/logo.png"
                alt="Momo Plaza"
                style={{
                  height: 80,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.5))',
                }}
              />
            </div>
            <p style={{ color: 'rgba(255,237,213,0.55)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 260 }}>
              Authentic Momo. Bengali Soul. Bringing you the taste of the hills right to Kolkata.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: '#f59e0b', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: '🏠 Home', href: '#home' },
                { label: '🥟 Our Menu', href: '#menu' },
                { label: '📍 Find Us', href: '#map' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{
                  color: 'rgba(255,237,213,0.65)', fontSize: '0.88rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = '#f59e0b'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,237,213,0.65)'}
                >{l.label}</a>
              ))}
            </div>
          </motion.div>

          {/* Social & Follow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: '#f59e0b', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Follow Us
            </h4>
            <motion.a
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(245,158,11,0.3)' }}
              whileTap={{ scale: 0.97 }}
              href="https://instagram.com/momo.plaza"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem',
                padding: '0.7rem 1.4rem', borderRadius: 14,
                textDecoration: 'none', marginBottom: '1rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              📸 @momo.plaza
            </motion.a>
            <p style={{ color: 'rgba(255,237,213,0.4)', fontSize: '0.75rem', lineHeight: 1.6 }}>
              For daily updates, offers &amp; behind-the-scenes fun!
            </p>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.4rem', textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,237,213,0.25)', fontSize: '0.78rem', fontWeight: 500 }}>
            &copy; {new Date().getFullYear()} Momo Plaza. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,237,213,0.2)', fontSize: '0.7rem' }}>
            Made with ❤️ for momo lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
