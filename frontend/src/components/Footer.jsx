// components/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const styles = {
    footer: {
      marginTop: '4rem',
      background: 'linear-gradient(135deg, #0B1120 0%, #1A2332 100%)',
      color: '#ffffff',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 -20px 40px rgba(0, 0, 0, 0.4)',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #FF6B6B)',
      backgroundSize: '300% 100%',
      animation: 'gradientMove 6s ease infinite',
    },
    container: {
      margin: '0 auto',
      padding: '3rem 1rem',
      position: 'relative',
      zIndex: 2,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
    },
    brandSection: {
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '20px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 107, 107, 0.1)',
      backdropFilter: 'blur(10px)',
    },
    brandTitle: {
      fontSize: 'clamp(1.5rem, 6vw, 2rem)',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.75rem',
      letterSpacing: '-0.5px',
      textAlign: 'center',
    },
    brandDesc: {
      color: '#94A3B8',
      fontSize: 'clamp(0.85rem, 3.5vw, 0.95rem)',
      lineHeight: 1.6,
      marginBottom: '1.25rem',
      textAlign: 'center',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.75rem',
      marginTop: '1.25rem',
    },
    statItem: {
      textAlign: 'center',
      padding: '0.75rem 0.5rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 107, 107, 0.1)',
    },
    statNumber: {
      fontSize: 'clamp(1rem, 4vw, 1.25rem)',
      fontWeight: 700,
      color: '#FF6B6B',
      marginBottom: '0.15rem',
    },
    statLabel: {
      fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
      color: '#64748B',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    sectionTitle: {
      fontSize: 'clamp(1rem, 4vw, 1.1rem)',
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: '1.25rem',
      position: 'relative',
      paddingBottom: '0.75rem',
      letterSpacing: '0.5px',
      textAlign: 'center',
    },
    sectionTitleUnderline: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '3px',
      background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)',
      borderRadius: '2px',
    },
    linksList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    linkItem: {
      marginBottom: '0.75rem',
    },
    link: {
      color: '#94A3B8',
      textDecoration: 'none',
      fontSize: 'clamp(0.9rem, 3.5vw, 0.95rem)',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    popularTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      justifyContent: 'center',
    },
    tag: {
      background: 'rgba(255, 107, 107, 0.1)',
      color: '#FF6B6B',
      padding: '0.35rem 0.9rem',
      borderRadius: '20px',
      fontSize: 'clamp(0.75rem, 3vw, 0.85rem)',
      fontWeight: 500,
      border: '1px solid rgba(255, 107, 107, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    contactItem: {
      color: '#94A3B8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontSize: 'clamp(0.85rem, 3.5vw, 0.95rem)',
      padding: '1rem 0.75rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.03)',
      textAlign: 'center',
    },
    contactIcon: {
      width: '20px',
      height: '20px',
      color: '#FF6B6B',
      flexShrink: 0,
    },
    appButtons: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.25rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    appButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 107, 107, 0.2)',
      borderRadius: '12px',
      padding: '0.7rem 1.2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#ffffff',
      fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
      fontWeight: 500,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      flex: window.innerWidth < 380 ? '1' : 'none',
      justifyContent: 'center',
    },
    socialLinks: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.25rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    socialLink: {
      width: 'clamp(35px, 8vw, 40px)',
      height: 'clamp(35px, 8vw, 40px)',
      borderRadius: '50%',
      background: 'rgba(255, 107, 107, 0.1)',
      border: '1px solid rgba(255, 107, 107, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FF6B6B',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
    },
    bottomBar: {
      marginTop: '2.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
    },
    copyright: {
      color: '#64748B',
      fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
      textAlign: 'center',
      lineHeight: 1.5,
      padding: '0 0.5rem',
    },
    paymentMethods: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    paymentIcon: {
      width: 'clamp(35px, 10vw, 40px)',
      height: 'clamp(22px, 6vw, 25px)',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.6rem, 2.5vw, 0.7rem)',
      color: '#94A3B8',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
  };

  const mediaStyles = `
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Tablet and up */
    @media (min-width: 640px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .footer-section {
        text-align: left !important;
      }
      
      .footer-title-underline {
        left: 0 !important;
        transform: none !important;
      }
      
      .social-links {
        justify-content: flex-start !important;
      }
      
      .popular-tags {
        justify-content: flex-start !important;
      }
      
      .app-buttons {
        justify-content: flex-start !important;
      }
      
      .contact-item {
        flex-direction: row !important;
        text-align: left !important;
      }
      
      .stats-container {
        grid-template-columns: repeat(3, 1fr) !important;
      }
      
      .footer-section h3 {
        text-align: left !important;
      }
    }

    /* Desktop */
    @media (min-width: 1024px) {
      .footer-grid {
        grid-template-columns: 2fr 1fr 1fr 1.5fr !important;
      }
      
      .footer-container {
        padding: 4rem 2rem !important;
      }
    }

    /* Large Desktop */
    @media (min-width: 1280px) {
      .footer-container {
        padding: 4rem 4rem !important;
      }
    }

    /* Mobile Styles (below 640px) */
    @media (max-width: 639px) {
      .footer-section {
        text-align: center;
      }
      
      .footer-title-underline {
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
      
      .social-links {
        justify-content: center !important;
      }
      
      .popular-tags {
        justify-content: center !important;
      }
      
      .app-buttons {
        justify-content: center !important;
      }
      
      .contact-item {
        flex-direction: column !important;
        text-align: center !important;
      }
      
      .stats-container {
        grid-template-columns: repeat(3, 1fr) !important;
      }
      
      .footer-section h3 {
        text-align: center !important;
      }
    }

    /* Small Mobile (400px - 480px) */
    @media (max-width: 480px) {
      .footer-container {
        padding: 2.5rem 0.75rem !important;
      }
      
      .brand-section {
        padding: 1.25rem !important;
      }
      
      .stats-container {
        gap: 0.5rem !important;
      }
      
      .stat-item {
        padding: 0.6rem 0.25rem !important;
      }
      
      .app-buttons {
        flex-direction: column !important;
        width: 100% !important;
      }
      
      .app-button {
        width: 100% !important;
        justify-content: center !important;
      }
      
      .payment-methods {
        gap: 0.5rem !important;
      }
      
      .popular-tags {
        gap: 0.4rem !important;
      }
      
      .tag {
        padding: 0.3rem 0.7rem !important;
      }
    }

    /* Extra Small Mobile (320px - 399px) */
    @media (max-width: 399px) {
      .footer-container {
        padding: 2rem 0.6rem !important;
      }
      
      .brand-section {
        padding: 1rem !important;
      }
      
      .stats-container {
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
      }
      
      .stat-item {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 0.6rem 1rem !important;
      }
      
      .stat-number {
        margin-bottom: 0 !important;
      }
      
      .app-buttons {
        gap: 0.5rem !important;
      }
      
      .social-links {
        gap: 0.5rem !important;
      }
      
      .social-link {
        width: 32px !important;
        height: 32px !important;
      }
      
      .payment-methods {
        gap: 0.4rem !important;
      }
      
      .payment-icon {
        width: 32px !important;
        height: 20px !important;
        font-size: 0.55rem !important;
      }
      
      .contact-item {
        padding: 0.75rem 0.5rem !important;
      }
    }

    /* Ultra Small Mobile (280px - 319px) */
    @media (max-width: 319px) {
      .footer-container {
        padding: 1.5rem 0.5rem !important;
      }
      
      .brand-title {
        font-size: 1.3rem !important;
      }
      
      .brand-desc {
        font-size: 0.75rem !important;
      }
      
      .stat-item {
        padding: 0.5rem 0.75rem !important;
      }
      
      .stat-number {
        font-size: 0.9rem !important;
      }
      
      .stat-label {
        font-size: 0.6rem !important;
      }
      
      .section-title {
        font-size: 0.9rem !important;
        margin-bottom: 1rem !important;
      }
      
      .footer-link {
        font-size: 0.8rem !important;
      }
      
      .tag {
        font-size: 0.65rem !important;
        padding: 0.25rem 0.6rem !important;
      }
      
      .contact-item {
        font-size: 0.75rem !important;
        padding: 0.6rem 0.4rem !important;
      }
      
      .contact-icon {
        width: 16px !important;
        height: 16px !important;
      }
      
      .app-button {
        font-size: 0.7rem !important;
        padding: 0.5rem 0.8rem !important;
      }
      
      .social-link {
        width: 28px !important;
        height: 28px !important;
        font-size: 0.8rem !important;
      }
      
      .copyright {
        font-size: 0.65rem !important;
      }
      
      .payment-icon {
        width: 28px !important;
        height: 18px !important;
        font-size: 0.5rem !important;
      }
    }

    /* Hover effects */
    .footer-link:hover {
      color: #FF6B6B !important;
      transform: translateX(5px);
    }

    .tag:hover {
      background: #FF6B6B !important;
      color: #ffffff !important;
      transform: translateY(-2px);
    }

    .social-link:hover {
      background: #FF6B6B !important;
      color: #ffffff !important;
      transform: translateY(-3px);
    }

    .app-button:hover {
      background: rgba(255, 107, 107, 0.15) !important;
      border-color: #FF6B6B !important;
      transform: translateY(-2px);
    }

    .contact-item:hover {
      border-color: rgba(255, 107, 107, 0.3) !important;
      transform: translateX(5px);
    }
  `;

  return (
    <>
      <style>{mediaStyles}</style>
      <footer style={styles.footer}>
        <div style={styles.gradientOverlay}></div>
        
        <div style={styles.container} className="footer-container">
          <div style={styles.grid} className="footer-grid">
            
            {/* Brand Section with Stats */}
            <div style={styles.brandSection} className="brand-section">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img
                  src="/brand_logo.jpg"
                  alt="Momo Plaza"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: '50%',
                    border: '2.5px solid rgba(255,107,107,0.5)',
                    boxShadow: '0 0 24px rgba(255,107,107,0.3), 0 8px 24px rgba(0,0,0,0.4)'
                  }}
                />
              </div>
              <h3 style={styles.brandTitle} className="brand-title">MOMO PLAZA</h3>
              <p style={styles.brandDesc} className="brand-desc">
                Discover the best momos & Himalayan cuisine in your city. From steamed to fried, pan-fried to tandoori — we bring the finest momo experience right to your doorstep.
              </p>
              
              <div style={styles.statsContainer} className="stats-container">
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>500+</div>
                  <div style={styles.statLabel}>Restaurants</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>50k+</div>
                  <div style={styles.statLabel}>Happy Customers</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>8</div>
                  <div style={styles.statLabel}>Cities</div>
                </div>
              </div>

              <div style={styles.appButtons} className="app-buttons">
                <div style={styles.appButton} className="app-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </div>
                <div style={styles.appButton} className="app-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3v18h18V3H3zm15 5h-2.42v.69h2.27V10h-2.27v2.42h-1.14V10h-1.16V8.69h1.16v-.54c0-.97.44-1.56 1.51-1.56h1.05v1.16h-.66c-.45 0-.49.21-.49.56v.38H18V8z" />
                  </svg>
                  Google Play
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 style={styles.sectionTitle}>
                Quick Links
                <span style={styles.sectionTitleUnderline} className="footer-title-underline"></span>
              </h3>
              <ul style={styles.linksList}>
                {['Home', 'Menu', 'Offers', 'New Arrivals', 'Contact Us'].map((item) => (
                  <li key={item} style={styles.linkItem}>
                    <a href="#" style={styles.link} className="footer-link">
                      <span>→</span> {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Cuisines */}
            <div className="footer-section">
              <h3 style={styles.sectionTitle}>
                Popular Cuisines
                <span style={styles.sectionTitleUnderline} className="footer-title-underline"></span>
              </h3>
              <div style={styles.popularTags} className="popular-tags">
                {['North Indian', 'Chinese', 'Italian', 'Burgers', 'Pizza', 'Desserts', 'South Indian', 'Beverages'].map((tag) => (
                  <span key={tag} style={styles.tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              
              <h3 style={{...styles.sectionTitle, marginTop: '2rem'}}>
                Follow Us
                <span style={styles.sectionTitleUnderline} className="footer-title-underline"></span>
              </h3>
              <div style={styles.socialLinks} className="social-links">
                {['F', 'T', 'I', 'YT'].map((social, index) => (
                  <div key={index} style={styles.socialLink} className="social-link">
                    {social}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Download */}
            <div className="footer-section">
              <h3 style={styles.sectionTitle}>
                Get in Touch
                <span style={styles.sectionTitleUnderline} className="footer-title-underline"></span>
              </h3>
              
              <div style={styles.contactItem} className="contact-item">
                <svg style={styles.contactIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Bengaluru, India 560001</span>
              </div>
              
              <div style={styles.contactItem} className="contact-item">
                <svg style={styles.contactIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 98765 43210</span>
              </div>
              
              <div style={styles.contactItem} className="contact-item">
                <svg style={styles.contactIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@momoplaza.com</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar with Payment Methods */}
          <div style={styles.bottomBar} className="bottom-bar">
            <p style={styles.copyright}>
              © {currentYear} MOMO PLAZA. Crafted with ❤️ for momo lovers
            </p>
            
            <div style={styles.paymentMethods} className="payment-methods">
              <span style={styles.paymentIcon}>VISA</span>
              <span style={styles.paymentIcon}>MC</span>
              <span style={styles.paymentIcon}>UPI</span>
              <span style={styles.paymentIcon}>PayTM</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;