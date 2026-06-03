import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Send, User, ChefHat, Star, Zap, Mic, Smile, Clock, TrendingUp, Award, Leaf, Flame, MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

// ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────
async function callGemini(userMessage, history = [], token) {
  try {
    const { data } = await axios.post('/api/ai/recommend', 
      { message: userMessage, history },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.text;
  } catch (error) {
    // Console error removed to satisfy user requirements
    throw error;
  }
}

const LOCAL_GENIE_BRAIN = {
  'hi': "Hello! I'm your Momo Plaza Genie. Ready to order something delicious? 🧞‍♂️✨",
  'hello': "Hi there! I can help you find the best food in town. Try asking for 'Pizza' or 'Burger'! 🍔",
  'who are you': "I'm the Momo Plaza Genie! I can find your favorite dishes, manage your cart, and even help you checkout. 🚀",
  'how are you': "I'm doing great! Just hungry for some code and good food. How can I help you today? 😊",
  'bye': "Goodbye! See you soon for your next meal! 👋",
  'thanks': "You're very welcome! Enjoy your meal! 🍛",
  'thank you': "Anytime! I'm here to make your food ordering magic. ✨"
};
// ──────────────────────────────────────────────────────────────────

export default function AiAssistant() {
  const { userInfo } = useAuth();
  const { addToCartViaAI } = useCart();
  const navigate = useNavigate();
  
  // ─── CRITICAL: Define all state variables here ───
  const [isOpen, setIsOpen] = useState(false);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm Momo Plaza Genie 🧞 Tell me what you're craving and I'll find the perfect dish for you!", timestamp: now(), read: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  // ─────────────────────────────────────────────────

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Cooldown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Fetch menu items to handle auto-order actions
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get('/api/menu');
        setAllMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Menu fetch error:", err);
        setAllMenuItems([]);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async (msgText) => {
    const text = (msgText !== undefined ? msgText : input).trim();
    if (!text || isTyping || cooldown > 0) return;

    const userMsg = { role: 'user', text, timestamp: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const history = messages.slice(-6);
      
      if (!userInfo) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: "Please log in so I can help you with personalized recommendations! 🔑", 
          timestamp: now(), 
          read: true 
        }]);
        setIsTyping(false);
        return;
      }

      // --- NEW: Client-side Intent Matching with Fuzzy Logic ---
      const cleanMsg = text.toLowerCase().trim()
        .replace(/order|want|to|have|can|i|please|get|me|a|some/g, '') // Clean filler words
        .replace(/[0-9]|₹|rs|rs.|-|,|\.|\/|qty|quantity/g, '') // Strip prices, numbers and symbols
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
      
      if (cleanMsg.length > 2) {
        // Simple fuzzy score (distance based)
        const getScore = (s1, s2) => {
          const longer = s1.length > s2.length ? s1 : s2;
          const shorter = s1.length > s2.length ? s2 : s1;
          if (longer.length === 0) return 1.0;
          
          // Levenshtein-ish edit distance
          const costs = [];
          for (let i = 0; i <= longer.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= shorter.length; j++) {
              if (i === 0) costs[j] = j;
              else if (j > 0) {
                let newValue = costs[j - 1];
                if (longer.charAt(i - 1) !== shorter.charAt(j - 1))
                  newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
              }
            }
            if (i > 0) costs[shorter.length] = lastValue;
          }
          return (longer.length - costs[shorter.length]) / parseFloat(longer.length);
        };

        const scoredMatches = allMenuItems.map(item => {
          const name = item.name.toLowerCase();
          // Precise whole-string match boost
          if (name === cleanMsg || cleanMsg.includes(name) || name.includes(cleanMsg)) {
            return { item, score: 0.95 };
          }
          
          const words = name.split(' ');
          const wordScores = words.map(w => getScore(cleanMsg, w));
          const maxWordScore = Math.max(...wordScores);
          return { item, score: maxWordScore };
        }).filter(m => m.score > 0.5).sort((a,b) => b.score - a.score);

        if (scoredMatches.length > 0 && scoredMatches[0].score > 0.7) {
          const localMatch = scoredMatches[0].item;
          console.log("🧞 Frontend: Local Match Found:", localMatch.name);
          const itemId = String(localMatch._id || localMatch.id);
          const result = addToCartViaAI({ ...localMatch, id: itemId });
          
          if (!result.success && result.reason === 'daily_limit') {
            setMessages(prev => [...prev, { 
              role: 'ai', 
              text: `Oh no! 😅 I've already recommended 1 new dish today. Come back tomorrow and I can suggest **${localMatch.name}** for you! But you can still add it manually from the menu if you'd like.`, 
              timestamp: now(), 
              read: true 
            }]);
            setIsTyping(false);
            return;
          }

          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `Got it! I've added **${localMatch.name}** to your cart! 🛒 ✨`, 
            timestamp: now(), 
            read: true 
          }]);
          setIsTyping(false);
          return; // SKIP API CALL
        }

        // --- NEW: Local Greeting Brain ---
        const greetingMatch = LOCAL_GENIE_BRAIN[cleanMsg];
        if (greetingMatch) {
          setMessages(prev => [...prev, { role: 'ai', text: greetingMatch, timestamp: now(), read: true }]);
          setIsTyping(false);
          return;
        }
        
        // No high-confidence match? No problem. Fall through to Gemini AI for a "normal response"
        // -------------------------------------
      }
      // ---------------------------------------------------------
      
      // Only call Gemini for truly generic questions that don't look like food intents
      // This massively reduces quota usage.
      const aiText = await callGemini(text, history, userInfo.token);
      
      // Process Actions
      let processedText = aiText;
      if (aiText.includes('[ACTION:ORDER|')) {
        const match = aiText.match(/\[ACTION:ORDER\|([^\]]+)\]/);
        if (match) {
          const rawId = match[1].trim();
          // Find the item with robust string comparison
          const item = allMenuItems.find(i => String(i._id) === rawId || String(i.id) === rawId);
          
          if (item) {
            console.log("🧞 Genie Auto-adding:", item.name);
            const itemId = String(item._id || item.id);
            const result = addToCartViaAI({ ...item, id: itemId });
            
            if (!result.success && result.reason === 'daily_limit') {
              // Remove the action from display and show error message
              processedText = aiText.replace(/\[ACTION:ORDER\|[^\]]+\]/, '');
              const errorMsg = `I'd love to add **${item.name}** for you, but I've reached my daily recommendation limit of 1 new item! 😅 You can still add it manually from the menu though!`;
              setMessages(prev => [...prev, { 
                role: 'ai', 
                text: errorMsg, 
                timestamp: now(), 
                read: true 
              }]);
              setIsTyping(false);
              return;
            }
            
            // Check profile completion for auto-payment
            const isProfileComplete = !!(userInfo.address && userInfo.phone && userInfo.city && userInfo.zipCode);
            
            if (isProfileComplete) {
              setMessages(prev => [...prev, { 
                role: 'ai', 
                text: `I've added ${item.name} to your cart and since your delivery info is ready, I'm taking you to the payment page! 🚀`, 
                timestamp: now(), 
                read: true 
              }]);
              // Trigger navigation with autoPay flag
              setTimeout(() => navigate('/checkout', { state: { autoPay: true } }), 2000);
            } else {
              setMessages(prev => [...prev, { 
                role: 'ai', 
                text: `I've added ${item.name} to your cart! 🛒 Please complete your address in your profile so I can help you checkout faster.`, 
                timestamp: now(), 
                read: true 
              }]);
            }
            // Strip the tag from the text shown to user
            processedText = aiText.replace(/\[ACTION:ORDER\|[^\]]+\]/, '').trim();
          } else {
            console.warn("🧞 Genie: Item ID not found in local menu list:", rawId);
            // If menu is empty, maybe retry fetch
            if (allMenuItems.length === 0) {
                processedText = aiText.replace(/\[ACTION:ORDER\|[^\]]+\]/, '').trim() + "\n\n(Wait, I'm still loading the menu... please try again in a second! 🔄)";
                axios.get('/api/menu').then(({data}) => setAllMenuItems(data));
            }
          }
        }
      }

      if (processedText) {
        setMessages(prev => [...prev, { role: 'ai', text: processedText, timestamp: now(), read: true }]);
      }
    } catch (error) {
      // Silence only the 429 in console for a cleaner experience
      if (error.response?.status !== 429) {
          console.error("AI Error:", error);
      }
      
      let errorMsg = error.response?.data?.message || "Oops! Something went wrong. 🧞";
      
      if (error.response?.status === 429) {
          const waitTime = error.response?.data?.retryAfter || 60;
          setCooldown(waitTime);
          
          // --- Fallback Intelligence --- 
          // If Gemini fails, we still try to be helpful using local data
          const cleanMsg = text.toLowerCase().replace(/order|want|get|me|some|a|can|i|have|please|to/g, '').trim();
          const scoredMatches = allMenuItems.map(item => ({ item, score: item.name.toLowerCase().includes(cleanMsg) ? 0.8 : 0 }))
                                          .filter(m => m.score > 0.5);
          
          if (scoredMatches.length > 0) {
            errorMsg = `Gemini is busy, but I found **${scoredMatches[0].item.name}** in our menu! Would you like me to add it? 🍕`;
          } else {
            errorMsg = `I'm a bit busy right now! 🧞‍♂️ In the meantime, you can select any of our popular dishes below! 👇`;
          }
      }

      setMessages(prev => [...prev, { role: 'ai', text: errorMsg, timestamp: now(), read: true }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, userInfo, allMenuItems, addToCartViaAI, navigate, cooldown]);

  const formatText = (text) =>
    text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•')) {
        const itemName = trimmedLine.replace('•', '').trim();
        return (
          <motion.button 
            key={i}
            whileHover={{ scale: 1.02, background: 'rgba(239,68,68,0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSend(itemName)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              margin: '6px 0',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.95)',
              cursor: 'pointer',
              fontSize: '12.5px',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            {itemName}
          </motion.button>
        );
      }
      return (
        <span key={i} style={{ display: 'block', lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* Fixed wrapper - ensure it's above everything */
        .fg-fixed-wrapper {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 99999 !important;
          isolation: isolate !important;
        }

        .fg-panel { 
          font-family: 'DM Sans', sans-serif; 
          width: 380px !important;
          height: 600px !important;
          display: flex !important;
          flex-direction: column !important;
          background: linear-gradient(165deg,#0c0c12 0%,#10101a 60%,#080810 100%) !important;
          border-radius: 22px !important;
          box-shadow: 0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(239,68,68,0.16), inset 0 1px 0 rgba(255,255,255,0.04) !important;
          overflow: hidden !important;
        }

        .fg-msgs {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 14px 14px 8px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        .fg-msgs::-webkit-scrollbar { width: 3px; }
        .fg-msgs::-webkit-scrollbar-track { background: transparent; }
        .fg-msgs::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.25); border-radius: 99px; }

        .fg-msgs > div {
          flex-shrink: 0;
        }

        /* Ensure proper gap on mobile */
        @media (max-width: 600px) {
          .fg-msgs {
            gap: 10px !important;
          }
        }

        /* Horizontal scrollable sections */
        .fg-scroll-x { 
          display: flex; 
          gap: 8px; 
          overflow-x: auto; 
          scrollbar-width: thin; 
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .fg-scroll-x::-webkit-scrollbar { height: 3px; }
        .fg-scroll-x::-webkit-scrollbar-track { background: transparent; }
        .fg-scroll-x::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.25); border-radius: 99px; }

        .fg-pills { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr);
          gap: 8px; 
          padding-bottom: 5px;
          max-height: 300px;
          overflow-y: auto;
        }
        .fg-pills::-webkit-scrollbar { height: 3px; }
        .fg-pills::-webkit-scrollbar-track { background: transparent; }
        .fg-pills::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.25); border-radius: 99px; }

        .fg-input { 
          background: transparent; 
          border: none; 
          color: rgba(255,255,255,0.9); 
          font-size: 13px; 
          font-family: 'DM Sans', sans-serif; 
          flex: 1; 
          padding: 0; 
          min-width: 0; 
        }
        .fg-input::placeholder { color: rgba(255,255,255,0.25); }
        .fg-input:focus { outline: none; }

        .fg-btn { 
          cursor: pointer; 
          border: none; 
          background: none; 
          padding: 0; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-family: 'DM Sans', sans-serif; 
        }
        .fg-btn:disabled { cursor: not-allowed; }

        .fg-content {
          flex-shrink: 0 !important;
        }

        /* Mobile Close Button - New addition */
        .fg-mobile-close {
          display: none !important;
          position: sticky !important;
          bottom: 0 !important;
          width: 100% !important;
          padding: 12px !important;
          background: linear-gradient(to top, #0c0c12 70%, transparent) !important;
          z-index: 20 !important;
        }

        /* Mobile specific styles */
        @media (max-width: 768px) {
          .fg-fixed-wrapper {
            bottom: 16px !important;
            right: 16px !important;
          }
          
          .fg-panel {
            width: 360px !important;
            height: 550px !important;
          }
          
          .fg-pills {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .fg-msgs {
            padding: 12px 12px 6px !important;
          }
        }

        @media (max-width: 600px) {
          .fg-fixed-wrapper {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
          }
          
          .fg-panel {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100vh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            z-index: 100000 !important;
            flex-direction: column !important;
          }

          .fg-content {
            flex-shrink: 0 !important;
            width: 100% !important;
          }

          .fg-content:nth-child(1) {
            padding-top: max(12px, env(safe-area-inset-top, 12px)) !important;
            padding-left: max(14px, env(safe-area-inset-left, 14px)) !important;
            padding-right: max(14px, env(safe-area-inset-right, 14px)) !important;
          }

          .fg-content:nth-child(3) {
            padding-bottom: 0 !important;
            padding-left: max(12px, env(safe-area-inset-left, 12px)) !important;
            padding-right: max(12px, env(safe-area-inset-right, 12px)) !important;
          }

          .fg-msgs {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            padding: 12px 12px 8px !important;
            padding-left: max(12px, env(safe-area-inset-left, 12px)) !important;
            padding-right: max(12px, env(safe-area-inset-right, 12px)) !important;
          }
          
          .fg-pills {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            overflow-y: auto !important;
          }

          .fg-pill {
            font-size: 11px !important;
            padding: 9px 8px !important;
          }

          .fg-input {
            font-size: 14px !important;
            padding: 8px 8px !important;
          }

          .fg-scroll-x {
            max-height: 200px;
            overflow-y: auto;
          }

          /* Show mobile close button */
          .fg-mobile-close {
            display: flex !important;
          }

          /* Hide desktop close button on mobile */
          .fg-desktop-close {
            display: none !important;
          }
        }

        @media (max-width: 420px) {
          .fg-pills {
            grid-template-columns: 1fr !important;
          }

          .fg-panel {
            height: 100vh !important;
            height: 100dvh !important;
          }
        }

        /* Hide tooltip on mobile */
        @media (max-width: 600px) { 
          .fg-tooltip { display: none !important; } 
          .fg-toggle-icon { display: none !important; }
        }
      `}</style>

      {/* Fixed wrapper */}
      <div className="fg-fixed-wrapper">
        {/* Chat Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fg-panel"
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            >
              {/* Ambient blobs */}
              <div style={{ position:'absolute', top:-50, right:-50, width:160, height:160, background:'radial-gradient(circle,rgba(239,68,68,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />
              <div style={{ position:'absolute', bottom:-40, left:-40, width:130, height:130, background:'radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

              {/* Header - with desktop close button */}
              <div className="fg-content" style={{ position:'relative', zIndex:1, background:'linear-gradient(125deg,#b91c1c 0%,#ef4444 50%,#dc2626 100%)', padding:'14px 14px 12px' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(0,0,0,0.18) 0%,transparent 55%)', pointerEvents:'none' }} />
                <div style={{ position:'relative', display:'flex', alignItems:'center', gap:10 }}>
                  <motion.div
                    animate={{ rotate:[0,6,-6,0], scale:[1,1.05,1] }}
                    transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                    style={{ flexShrink:0, width:40, height:40, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(12px)', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.28)', boxShadow:'0 4px 14px rgba(0,0,0,0.2)' }}
                  >
                    <ChefHat size={20} color="white" />
                  </motion.div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'white', letterSpacing:'-0.2px', whiteSpace:'nowrap' }}>Momo Plaza</span>
                      <span style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:20, padding:'1px 6px', fontSize:8, color:'white', fontWeight:700, letterSpacing:'0.8px', lineHeight:1.4 }}>AI</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      <motion.div animate={{ scale:[1,1.35,1], opacity:[1,0.6,1] }} transition={{ duration:1.8, repeat:Infinity }} style={{ width:5, height:5, background:'#4ade80', borderRadius:'50%', boxShadow:'0 0 6px rgba(74,222,128,0.8)', flexShrink:0 }} />
                      <span style={{ color:'rgba(255,255,255,0.88)', fontSize:10.5, fontWeight:500, whiteSpace:'nowrap' }}>Online</span>
                      <span style={{ color:'rgba(255,255,255,0.38)', fontSize:9, display:'flex', alignItems:'center', gap:2, whiteSpace:'nowrap' }}><Clock size={8}/> ~2s</span>
                    </div>
                  </div>

                  {/* Desktop close button */}
                  <motion.button 
                    whileHover={{ scale:1.1, background:'rgba(255,255,255,0.28)' }} 
                    whileTap={{ scale:0.9 }} 
                    onClick={() => setIsOpen(false)} 
                    className="fg-btn fg-desktop-close" 
                    style={{ flexShrink:0, width:30, height:30, borderRadius:9, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.22)', color:'white' }}
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              </div>

              {/* Messages - Now with proper fixed height */}
              <div
                ref={messagesContainerRef}
                className="fg-msgs"
              >
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity:0, y:8 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ type:'spring', damping:24 }}
                    style={{ display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start' }}
                  >
                    <div style={{ display:'flex', alignItems:'flex-end', gap:8, maxWidth:'88%', flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}>
                      <div style={{ flexShrink:0, width:28, height:28, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background: msg.role==='ai' ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#2a2a38,#1a1a24)', boxShadow: msg.role==='ai' ? '0 2px 10px rgba(239,68,68,0.3)' : 'none' }}>
                        {msg.role==='ai' ? <Bot size={14} color="white" /> : <User size={14} color="rgba(255,255,255,0.65)" />}
                      </div>

                      <div style={{ display:'flex', flexDirection:'column', gap:5, minWidth:0 }}>
                        <div style={{
                          padding:'10px 13px',
                          borderRadius: msg.role==='user' ? '15px 15px 3px 15px' : '15px 15px 15px 3px',
                          background: msg.role==='user' ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : msg.isError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.055)',
                          border: msg.role==='user' ? 'none' : msg.isError ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.08)',
                          color:'rgba(255,255,255,0.9)',
                          fontSize:13,
                          lineHeight:1.65,
                          boxShadow: msg.role==='user' ? '0 3px 14px rgba(239,68,68,0.28)' : '0 2px 8px rgba(0,0,0,0.2)',
                          backdropFilter: msg.role==='ai' ? 'blur(10px)' : 'none',
                          wordBreak:'break-word',
                        }}>
                          {formatText(msg.text)}
                        </div>
                        <span style={{ fontSize:9, color:'rgba(255,255,255,0.2)', padding:'0 3px', textAlign: msg.role==='user' ? 'right' : 'left' }}>
                          {msg.timestamp}
                          {msg.role==='ai' && msg.read && <span style={{ color:'rgba(239,68,68,0.4)', marginLeft:5 }}>✓ Read</span>}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
                    <div style={{ flexShrink:0, width:28, height:28, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#ef4444,#b91c1c)', boxShadow:'0 2px 10px rgba(239,68,68,0.3)' }}>
                      <Bot size={14} color="white" />
                    </div>
                    <div style={{ padding:'11px 14px', borderRadius:'15px 15px 15px 3px', background:'rgba(255,255,255,0.055)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                        {[0,0.18,0.36].map((delay,i) => (
                          <motion.div key={i} animate={{ y:[0,-5,0], opacity:[0.4,1,0.4] }} transition={{ duration:0.65, repeat:Infinity, delay }} style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444' }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Popular Pills - Scrollable */}
              <div className="fg-content" style={{ position:'relative', zIndex:1, padding:'6px 11px 4px', maxHeight:'180px', flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:5 }}>
                  <TrendingUp size={9} color="#ef4444" />
                  <span style={{ fontSize:8.5, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'1.2px', textTransform:'uppercase' }}>Popular</span>
                </div>
                <div className="fg-pills">
                  {allMenuItems.slice(0, 10).map((item, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ scale:1.02, background:'rgba(255,255,255,0.08)' }} 
                      whileTap={{ scale:0.98 }} 
                      onClick={() => handleSend(item.name)} 
                      className="fg-btn fg-pill" 
                      disabled={isTyping}
                      style={{ 
                        padding:'7px 9px', 
                        background:'rgba(255,255,255,0.05)', 
                        border:'1px solid rgba(255,255,255,0.1)', 
                        borderRadius:10, 
                        fontSize:10, 
                        color:'rgba(255,255,255,0.7)', 
                        textAlign:'left',
                        display:'flex',
                        alignItems:'center',
                        gap:'5px',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        opacity: isTyping ? 0.5 : 1,
                        minHeight: '34px'
                      }}>
                      <span style={{ fontSize:13, flexShrink: 0 }}>{item.isVeg ? '🌱' : '🍗'}</span>
                      <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize: '10px' }}>{item.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="fg-content" style={{ position:'relative', zIndex:1, padding:'9px 12px 12px', borderTop:'1px solid rgba(255,255,255,0.055)', background:'rgba(0,0,0,0.3)', backdropFilter:'blur(20px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.055)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'5px 5px 5px 11px' }}>
                  <input
                    ref={inputRef}
                    className="fg-input"
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && !e.shiftKey && handleSend()}
                    placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Ask about food..."}
                    disabled={isTyping || cooldown > 0}
                    style={{ fontSize: '13px', padding: '8px 8px' }}
                  />
                  <div style={{ display:'flex', gap:3, alignItems:'center', flexShrink:0 }}>
                    <motion.button 
                      whileHover={{ scale:1.08 }} 
                      whileTap={{ scale:0.92 }} 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping || cooldown > 0}
                      className="fg-btn"
                      style={{ width:32, height:32, borderRadius:9, background: input.trim() && !isTyping && cooldown === 0 ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'rgba(255,255,255,0.06)', color: input.trim() && !isTyping && cooldown === 0 ? 'white' : 'rgba(255,255,255,0.2)', boxShadow: input.trim() && !isTyping && cooldown === 0 ? '0 3px 12px rgba(239,68,68,0.35)' : 'none', transition:'all 0.18s', minWidth: '32px' }}>
                      {cooldown > 0 ? <span style={{fontSize:9, fontWeight:700}}>{cooldown}</span> : <Send size={13} />}
                    </motion.button>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6, padding:'0 2px', fontSize:'8px' }}>
                  <span style={{ color:'rgba(255,255,255,0.2)' }}>Powered by Gemini AI</span>
                  <span style={{ color:'rgba(255,255,255,0.2)' }}>~2s</span>
                </div>
              </div>

              {/* Mobile Close Button - New addition */}
              <div className="fg-mobile-close">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(239,68,68,0.4)',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronDown size={20} />
                  <span>Close Chat</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale:1.1 }}
          whileTap={{ scale:0.88 }}
          onClick={() => setIsOpen(p => !p)}
          className="fg-btn"
          style={{ position:'relative', width:60, height:60, marginTop: isOpen ? 12 : 0 }}
        >
          {!isOpen && <>
            <motion.div animate={{ scale:[1,1.7,1], opacity:[0.28,0,0.28] }} transition={{ duration:2.2, repeat:Infinity }} style={{ position:'absolute', inset:0, background:'#ef4444', borderRadius:'50%' }} />
            <motion.div animate={{ scale:[1,2.2,1], opacity:[0.14,0,0.14] }} transition={{ duration:2.8, repeat:Infinity, delay:0.5 }} style={{ position:'absolute', inset:0, background:'#ef4444', borderRadius:'50%' }} />
          </>}
          <motion.div
            animate={{ background: isOpen ? '#ffffff' : ['#ef4444','#dc2626','#ef4444'] }}
            transition={{ duration:3, repeat:Infinity }}
            style={{ position:'absolute', inset:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: isOpen ? '0 6px 20px rgba(0,0,0,0.3)' : '0 8px 32px rgba(239,68,68,0.55)' }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="x" initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.15 }}>
                  <X size={24} color="#ef4444" />
                </motion.div>
              ) : (
                <motion.div key="msg" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90, opacity:0 }} transition={{ duration:0.15 }} style={{ position:'relative' }}>
                  <MessageCircle size={26} color="white" />
                  <motion.div animate={{ scale:[1,1.4,1] }} transition={{ duration:1.8, repeat:Infinity }} style={{ position:'absolute', top:-2, right:-2, width:10, height:10, background:'#4ade80', borderRadius:'50%', border:'2px solid #0c0c12', boxShadow:'0 0 6px rgba(74,222,128,0.8)' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Tooltip */}
          <div className="fg-tooltip" style={{ position:'absolute', right:'calc(100% + 12px)', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', whiteSpace:'nowrap' }}>
            <div style={{ background:'#111119', color:'rgba(255,255,255,0.82)', fontSize:12, padding:'7px 12px', borderRadius:10, border:'1px solid rgba(239,68,68,0.2)', boxShadow:'0 6px 24px rgba(0,0,0,0.5)', display:'flex', alignItems:'center', gap:7 }}>
              {isOpen ? '✨ Close Genie' : '🤖 Chat with Momo Plaza Genie'}
              <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:5, height:5, background:'#4ade80', borderRadius:'50%' }} />
              <div style={{ position:'absolute', right:-5, top:'50%', transform:'translateY(-50%) rotate(45deg)', width:8, height:8, background:'#111119', borderRight:'1px solid rgba(239,68,68,0.2)', borderTop:'1px solid rgba(239,68,68,0.2)' }} />
            </div>
          </div>
        </motion.button>
      </div>
    </>
  );
}