import React from 'react';
import { motion } from 'framer-motion';

const encodedAddress = encodeURIComponent(
  '709 (8, 136/4/2, Pashupati Bhattacharya Rd, East Behala, Green Park, Sarada Pally, Kolkata, West Bengal 700034'
);
const MAP_URL = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

const MapSection = () => {
  return (
    <section id="map" style={{
      width: '100%', backgroundColor: '#060200',
      padding: '6rem 1.5rem', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit,sans-serif', fontWeight: 900,
            fontSize: 'clamp(2.5rem,6vw,4rem)', letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg,#fff 30%,#f59e0b 70%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: '0.75rem',
          }}>FIND US</h2>
          <p style={{ color: 'rgba(255,237,213,0.55)', fontSize: '1rem', fontWeight: 500 }}>
            DINE IN &nbsp;|&nbsp; TAKE AWAY &nbsp;|&nbsp; DELIVERY
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
          alignItems: 'stretch',
        }}
          className="md:grid-cols-[1fr_1.4fr]"
        >
          {/* Address card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 70 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: '2.5rem',
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                fontSize: '2rem', width: 52, height: 52, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 14, background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>📍</div>
              <div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginBottom: 6 }}>
                  Our Address
                </h3>
                <p style={{ color: 'rgba(255,237,213,0.65)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  709 (8, 136/4/2, Pashupati Bhattacharya Rd,<br />
                  East Behala, Green Park, Sarada Pally,<br />
                  <strong style={{ color: '#f59e0b' }}>Kolkata, West Bengal 700034</strong>
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { emoji: '🍽️', label: 'Dine In — Welcome to our place!' },
                { emoji: '🥡', label: 'Take Away — Order & pick up!' },
                { emoji: '🛵', label: 'Home Delivery — Available nearby' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                  <span style={{ color: 'rgba(255,237,213,0.7)', fontSize: '0.88rem', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

            <motion.a
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(245,158,11,0.35)' }}
              whileTap={{ scale: 0.97 }}
              href="https://maps.app.goo.gl/ybtTupzPbb54nTAv6"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
                color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                padding: '0.85rem 1.5rem', borderRadius: 999,
                textDecoration: 'none', boxShadow: '0 6px 24px rgba(245,158,11,0.3)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Open in Google Maps
            </motion.a>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.15, type: 'spring', stiffness: 70 }}
            style={{
              borderRadius: 24, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              minHeight: 360, position: 'relative',
            }}
          >
            <iframe
              title="Momo Plaza Google Map"
              src={MAP_URL}
              style={{ width: '100%', height: '100%', minHeight: 360, border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default MapSection;
