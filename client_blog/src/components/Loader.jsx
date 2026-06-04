import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#060200',
            gap: '1.5rem',
            pointerEvents: 'none',
          }}
        >
          {/* Glow ring behind logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: 200, height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(220,38,38,0.15) 60%, transparent 80%)',
                filter: 'blur(12px)',
              }}
            />
            <motion.img
              src="/logo.png"
              alt="Momo Plaza"
              initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 160, height: 160,
                objectFit: 'contain',
                position: 'relative', zIndex: 1,
                filter: 'drop-shadow(0 0 24px rgba(245,158,11,0.7))',
              }}
            />
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{
              color: '#f59e0b',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>Momo Plaza</p>
            <p style={{
              color: 'rgba(255,237,213,0.45)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              fontWeight: 500,
            }}>Authentic Momo. Bengali Soul.</p>
          </motion.div>

          {/* Loading bar */}
          <div style={{
            width: 140, height: 2.5, borderRadius: 99,
            background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(to right, #f59e0b, #dc2626)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
