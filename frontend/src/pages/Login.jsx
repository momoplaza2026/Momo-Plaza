import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Utensils, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            login(data);
            toast.success(`Welcome back, ${data.name}!`);
            if (data.isDriver) {
                navigate('/driver/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ width: '400px', padding: '40px' }}
            >
                <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>Log in to your Momo Plaza account</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 12px 12px 45px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid var(--glass-border)', 
                                    borderRadius: '10px', 
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 45px 12px 45px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid var(--glass-border)', 
                                    borderRadius: '10px', 
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.3s',
                                    zIndex: 2
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-5px' }}>
                        <Link 
                            to="/forgot-password" 
                            style={{ 
                                color: 'var(--text-muted)', 
                                fontSize: '13px', 
                                textDecoration: 'none',
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ 
                            width: '100%', 
                            justifyContent: 'center', 
                            marginTop: '10px', 
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Log In'} <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Don't have an account?{' '}
                    <Link 
                        to="/signup" 
                        style={{ 
                            color: 'var(--primary)', 
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'opacity 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Sign Up
                    </Link>
                </p>
            </motion.div>

            <style>{`
                input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                }
                button[type="button"]:hover {
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
};

export default Login;