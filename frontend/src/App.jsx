import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import AdminPanel from './pages/AdminPanel';
import DriverDashboard from './pages/DriverDashboard';
import MenuPage from './pages/MenuPage';
import OffersPage from './pages/OffersPage';
import Navbar from './components/Navbar';
import AiAssistant from './components/AiAssistant';
import toast, { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { requestForToken, onMessageListener } from './firebase';
import axios from 'axios';
import { useNotifications } from './context/NotificationContext';
import WhatsAppButton from './components/WhatsAppButton';

// Configure global axios baseURL
axios.defaults.baseURL = 'https://momo-plaza.onrender.com';
axios.defaults.withCredentials = true;

// localStorage key to remember previously saved FCM token
const FCM_TOKEN_KEY = 'momoplaza_fcm_token';

function App() {
    const { fetchUnreadCount } = useNotifications();

    useEffect(() => {
        const setupNotifications = async () => {
            if (!('serviceWorker' in navigator)) return;

            try {
                const f = {
                    apiKey: "AIzaSyBPC3eojJtW60Jj47wAp2gAlCdyLO76Hhk",
                    authDomain: "credit-235dd.firebaseapp.com",
                    projectId: "credit-235dd",
                    storageBucket: "credit-235dd.firebasestorage.app",
                    messagingSenderId: "1068587415705",
                    appId: "1:1068587415705:web:1140d97921ad2f742c6008"
                };
                const swUrl = `/firebase-messaging-sw.js?apiKey=${f.apiKey}&authDomain=${f.authDomain}&projectId=${f.projectId}&storageBucket=${f.storageBucket}&messagingSenderId=${f.messagingSenderId}&appId=${f.appId}`;

                const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });

                const token = await requestForToken(registration);

                if (token) {
                    // ✅ Only POST to backend + show toast when the token is NEW or CHANGED
                    // This prevents the toast from firing on every single page reload
                    const savedToken = localStorage.getItem(FCM_TOKEN_KEY);

                    if (token !== savedToken) {
                        await axios.post('/api/users/subscribe', { token });
                        localStorage.setItem(FCM_TOKEN_KEY, token);

                        // Modern custom toast — only shown once on first subscribe / token refresh
                        toast.custom((t) => (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: 'rgba(10, 12, 18, 0.95)',
                                    backdropFilter: 'blur(24px)',
                                    WebkitBackdropFilter: 'blur(24px)',
                                    border: '1px solid rgba(34,197,94,0.25)',
                                    borderRadius: '18px',
                                    padding: '14px 16px 14px 14px',
                                    boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.08)',
                                    opacity: t.visible ? 1 : 0,
                                    transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    minWidth: '270px',
                                    maxWidth: '340px',
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '42px', height: '42px', flexShrink: 0,
                                    borderRadius: '13px',
                                    background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px', position: 'relative',
                                }}>
                                    🔔
                                    {/* Live green dot */}
                                    <div style={{
                                        position: 'absolute', top: '-3px', right: '-3px',
                                        width: '11px', height: '11px', borderRadius: '50%',
                                        background: '#22c55e',
                                        border: '2.5px solid rgba(10,12,18,0.95)',
                                        boxShadow: '0 0 8px rgba(34,197,94,0.8)',
                                    }} />
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '13px', fontWeight: '700', color: 'white',
                                        marginBottom: '3px', letterSpacing: '-0.1px',
                                    }}>
                                        Live Notifications Enabled
                                    </div>
                                    <div style={{
                                        fontSize: '11px', color: 'rgba(255,255,255,0.42)',
                                        lineHeight: 1.4,
                                    }}>
                                        Real-time order updates activated 🚀
                                    </div>
                                </div>

                                {/* Dismiss */}
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    style={{
                                        flexShrink: 0, background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px', cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.35)', fontSize: '14px',
                                        width: '26px', height: '26px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ), {
                            id: 'subscribe-success',
                            duration: 5000,
                        });
                    }
                    // Token unchanged → no toast, no API call — completely silent
                }
            } catch (error) {
                console.error('❌ Notification setup failed:', error);
            }
        };

        setupNotifications();

        // Listen for foreground messages
        onMessageListener((payload) => {
            console.log('✅ Message handled in App.jsx:', payload);
            fetchUnreadCount();
        });
    }, [fetchUnreadCount]);

    return (
        <Router>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/order/:id" element={<OrderDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/driver/dashboard" element={<DriverDashboard />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/offers" element={<OffersPage />} />
                </Routes>
            </main>
            <Footer />
            <AiAssistant />
            <WhatsAppButton />

            {/* Modern dark glassmorphism toaster */}
            <Toaster
                position="bottom-right"
                gutter={10}
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: 'rgba(10, 12, 18, 0.95)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                        maxWidth: '340px',
                    },
                    success: {
                        iconTheme: { primary: '#22c55e', secondary: '#0a0c12' },
                        style: {
                            background: 'rgba(10, 12, 18, 0.95)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(34,197,94,0.22)',
                            borderRadius: '14px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            padding: '12px 16px',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(34,197,94,0.08)',
                            maxWidth: '340px',
                        },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#0a0c12' },
                        style: {
                            background: 'rgba(10, 12, 18, 0.95)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(239,68,68,0.22)',
                            borderRadius: '14px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            padding: '12px 16px',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(239,68,68,0.08)',
                            maxWidth: '340px',
                        },
                    },
                }}
            />
        </Router>
    );
}

export default App;
