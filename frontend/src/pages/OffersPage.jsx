import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { 
  Tag, Clock, Copy, Check, Percent, IndianRupee, 
  ArrowRight, Gift, RefreshCw, AlertCircle, Sparkles
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { applyCoupon, cartItems, itemsPrice } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const fetchOffers = async (showToast = false) => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      const { data } = await axios.get("/api/offers");
      
      let offersArray = [];
      if (Array.isArray(data)) {
        offersArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        offersArray = data.data;
      } else if (data?.offers && Array.isArray(data.offers)) {
        offersArray = data.offers;
      } else if (data && typeof data === 'object') {
        offersArray = [data];
      }
      
      const activeOffers = offersArray.filter(offer => offer.isActive !== false);
      setOffers(activeOffers);
      
      if (showToast) {
        toast.success(`Found ${activeOffers.length} active offers!`, {
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626' }
        });
      }
      
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError(error.message);
      toast.error(`Failed to load offers`, {
        style: { background: '#1a1a1a', color: '#fff' }
      });
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isDriver) {
      navigate('/driver/dashboard');
    }
    fetchOffers();
  }, [userInfo, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code copied!`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #dc2626' },
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyOffer = async (offer) => {
    if (!userInfo) {
      toast.error("Please login", { style: { background: '#1a1a1a', color: '#fff' } });
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Add items to cart", { style: { background: '#1a1a1a', color: '#fff' } });
      navigate("/menu");
      return;
    }
    if (itemsPrice < offer.minOrderAmount) {
      toast.error(`Min ₹${offer.minOrderAmount} required`, {
        style: { background: '#1a1a1a', color: '#fff' },
      });
      return;
    }
    const success = await applyCoupon(offer.code);
    if (success) {
      toast.success("Offer applied!", { style: { background: '#1a1a1a', color: '#fff' } });
      setTimeout(() => navigate("/cart"), 1500);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const getDaysLeft = (validUntil) => {
    if (!validUntil) return 0;
    const diff = new Date(validUntil) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "40px",
            height: "40px",
            border: "2px solid rgba(220, 38, 38, 0.1)",
            borderTopColor: "#DC2626",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      background: '#0A0A0F',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    }}>
      <SEO 
        title="Special Offers & Discounts | Momo Plaza" 
        description="Get the best deals on Momos in Kolkata! Check out our latest coupon codes and discounts at Momo Plaza."
      />
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '80px 16px 40px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 600 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: window.innerWidth < 600 ? 'stretch' : 'center',
          marginBottom: '24px',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: window.innerWidth < 380 ? '22px' : '24px',
              fontWeight: '700',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}>
              <Gift size={window.innerWidth < 380 ? 20 : 24} color="#DC2626" />
              <span>Offers</span>
              <span style={{
                background: 'rgba(220,38,38,0.1)',
                color: '#DC2626',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                {offers.length}
              </span>
            </h1>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: '30px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              width: window.innerWidth < 400 ? '100%' : 'auto',
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '20px',
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#DC2626'
          }}>
            <AlertCircle size={18} />
            Failed to load offers
          </div>
        )}

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: window.innerWidth < 400 ? '40px 16px' : '50px 20px',
            background: 'rgba(20,20,30,0.5)',
            borderRadius: '16px',
            border: '1px solid rgba(220,38,38,0.1)',
          }}>
            <Tag size={45} style={{ color: '#DC2626', opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ color: '#94A3B8', fontSize: '16px' }}>No active offers</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr', // Always 1 column on mobile
              gap: window.innerWidth < 400 ? '12px' : '16px',
            }}>
              {offers.map((offer, index) => {
                const daysLeft = getDaysLeft(offer.validUntil);
                const isExpiring = daysLeft <= 3 && daysLeft > 0;
                
                return (
                  <motion.div
                    key={offer._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      width: '100%',
                      background: '#12121A',
                      border: `1px solid ${offer.color || '#DC2626'}20`,
                      borderRadius: '14px',
                      padding: window.innerWidth < 380 ? '14px' : '16px',
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Red Accent */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: `linear-gradient(180deg, ${offer.color || '#DC2626'}, ${offer.color || '#DC2626'}80)`,
                      borderRadius: '14px 0 0 14px',
                    }} />

                    <div style={{ marginLeft: '8px' }}>
                      {/* Top Row - Discount & Copy Button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}>
                        {/* Discount Badge */}
                        <span style={{
                          background: offer.discountType === "percentage" ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.1)',
                          color: offer.discountType === "percentage" ? '#22C55E' : (offer.color || '#DC2626'),
                          padding: window.innerWidth < 380 ? '4px 10px' : '5px 12px',
                          borderRadius: '20px',
                          fontSize: window.innerWidth < 380 ? '13px' : '14px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          {offer.discountType === "percentage" ? (
                            <>
                              <Percent size={window.innerWidth < 380 ? 12 : 14} color="#22C55E" />
                              {offer.discountValue}% OFF
                            </>
                          ) : (
                            <>
                              <IndianRupee size={window.innerWidth < 380 ? 12 : 14} />
                              ₹{offer.discountValue} OFF
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontSize: window.innerWidth < 380 ? '16px' : '17px',
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: '12px',
                      }}>
                        {offer.title}
                      </h3>

                      {/* Code Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        flexDirection: window.innerWidth < 320 ? 'column' : 'row',
                      }}>
                        <div style={{
                          background: '#0A0A0F',
                          border: '1px solid rgba(220,38,38,0.3)',
                          padding: window.innerWidth < 380 ? '8px 12px' : '8px 14px',
                          borderRadius: '10px',
                          flex: 1,
                          width: window.innerWidth < 320 ? '100%' : 'auto',
                        }}>
                          <span style={{
                            fontSize: window.innerWidth < 380 ? '15px' : '16px',
                            fontWeight: '800',
                            color: '#fff',
                            letterSpacing: '1px',
                          }}>
                            {offer.code}
                          </span>
                        </div>
                        
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyCode(offer.code)}
                          style={{
                            background: copiedCode === offer.code ? '#10b981' : '#DC2626',
                            border: 'none',
                            borderRadius: '10px',
                            padding: window.innerWidth < 380 ? '8px 14px' : '8px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: window.innerWidth < 380 ? '70px' : '80px',
                            width: window.innerWidth < 320 ? '100%' : 'auto',
                          }}
                        >
                          {copiedCode === offer.code ? (
                            <>
                              <Check size={14} color="#fff" />
                              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} color="#fff" />
                              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Details - 2 Column Layout */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '12px',
                        fontSize: '12px',
                      }}>
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '8px',
                          borderRadius: '8px',
                          textAlign: 'center',
                        }}>
                          <div style={{ color: '#94A3B8', fontSize: '10px', marginBottom: '2px' }}>Min Order</div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>₹{offer.minOrderAmount || 0}</div>
                        </div>
                        
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '8px',
                          borderRadius: '8px',
                          textAlign: 'center',
                        }}>
                          <div style={{ color: '#94A3B8', fontSize: '10px', marginBottom: '2px' }}>Used</div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{offer.usedCount || 0}</div>
                        </div>
                      </div>

                      {/* Valid Until */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isExpiring ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        fontSize: '12px',
                      }}>
                        <span style={{ color: '#94A3B8' }}>Valid until:</span>
                        <span style={{
                          color: isExpiring ? '#f59e0b' : '#fff',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Clock size={12} />
                          {formatDate(offer.validUntil)}
                          {isExpiring && ` (${daysLeft}d left)`}
                        </span>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => handleApplyOffer(offer)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: `linear-gradient(135deg, ${offer.color || '#DC2626'}, ${offer.color || '#B91C1C'})`,
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        Apply Offer <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Decorative Text */}
            <div style={{
              marginTop: '30px',
              textAlign: 'center',
              color: '#4A5568',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <Sparkles size={14} color="#DC2626" />
              New offers added weekly
              <Sparkles size={14} color="#DC2626" />
            </div>
          </>
        )}

        <style>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* Desktop: reduced margins */
          @media (min-width: 1024px) {
            div[style*="max-width: 1400px"] {
              padding-left: 30px !important;
              padding-right: 30px !important;
            }
            
            /* Desktop grid - 4 columns */
            div[style*="display: grid"] {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }

          /* Tablet */
          @media (min-width: 768px) and (max-width: 1023px) {
            div[style*="display: grid"] {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }

          /* Small Tablet */
          @media (min-width: 600px) and (max-width: 767px) {
            div[style*="display: grid"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          /* Mobile - always 1 column */
          @media (max-width: 599px) {
            div[style*="display: grid"] {
              grid-template-columns: 1fr !important;
            }
          }

          /* Small mobile (280px - 319px) */
          @media (max-width: 319px) {
            div[style*="padding: 80px 16px 40px"] {
              padding: 70px 10px 30px !important;
            }
            
            button, span, div {
              font-size: 11px !important;
            }
            
            div[style*="border-radius"] {
              border-radius: 10px !important;
            }
          }

          /* Ultra small (280px) */
          @media (max-width: 280px) {
            div[style*="padding: 80px 16px 40px"] {
              padding: 60px 8px 25px !important;
            }
            
            div[style*="padding: 14px"] {
              padding: 12px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OffersPage;