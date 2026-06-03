import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation as NavIcon, MapPin, Truck, Bike, Footprints, Car, AlertCircle } from 'lucide-react';
import axios from 'axios';

const MAP_CONTAINER_ID = 'driver-delivery-map';

const DriverMapModal = ({ isOpen, onClose, destination, orderId }) => {
    const mapRef = useRef(null);
    const directionRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState('driving'); // driving, walking, biking
    const [routeInfo, setRouteInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !destination) return;

        let isMounted = true;
        let map = null;

        const initMap = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Get Token
                const { data } = await axios.get('/api/mappls/token');
                const token = data.access_token;

                if (!isMounted) return;

                // 2. Load Direction Plugin
                await new Promise((resolve, reject) => {
                    if (window.mappls && window.mappls.direction) {
                        resolve();
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk_plugins?v=3.0&js=direction`;
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Failed to load Mappls Direction plugin'));
                    document.head.appendChild(script);
                });

                if (!isMounted) return;

                // 3. Get Current Position
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000
                    });
                });

                const { latitude: startLat, longitude: startLng } = position.coords;

                // 4. Resolve Destination Coordinates if missing
                    let finalDest = { lat: destination.lat, lng: destination.lng };
                if (!finalDest.lat || !finalDest.lng) {
                    try {
                        const geoResponse = await axios.get(`/api/mappls/geocode?address=${encodeURIComponent(destination.address)}`);
                        finalDest = { lat: geoResponse.data.lat, lng: geoResponse.data.lng };
                    } catch (geoErr) {
                        console.warn('Backend geocoding failed for full address. Trying fallback with city/postal code...');
                        
                        try {
                            const fallbackAddress = destination.city ? `${destination.city}, ${destination.postalCode || ''}` : destination.address;
                            const geoResponse2 = await axios.get(`/api/mappls/geocode?address=${encodeURIComponent(fallbackAddress)}`);
                            finalDest = { lat: geoResponse2.data.lat, lng: geoResponse2.data.lng };
                        } catch (fallbackErr) {
                            console.error('All geocoding methods failed:', fallbackErr);
                            throw new Error('Could not find delivery location on map. Please use the Navigate button instead.');
                        }
                    }
                }

                if (!isMounted) return;

                // 5. Initialize Map
                map = new window.mappls.Map(MAP_CONTAINER_ID, {
                    center: [startLng, startLat],
                    zoom: 12,
                    styles: 'vector'
                });
                mapRef.current = map;

                map.on('load', () => {
                    if (!isMounted) return;
                    
                    // 6. Initialize Direction
                    const directionOptions = {
                        map: map,
                        start: { label: 'My Location', geopoint: { lat: startLat, lng: startLng } },
                        end: { label: 'Customer Location', geopoint: { lat: finalDest.lat, lng: finalDest.lng } },
                        Resource: 'route_eta',
                        Profile: [profile],
                        callback: (res) => {
                            if (res && res.response && res.response.route) {
                                const route = res.response.route[0];
                                setRouteInfo({
                                    distance: (route.distance / 1000).toFixed(2), // km
                                    duration: Math.ceil(route.duration / 60), // mins
                                });
                            }
                        }
                    };

                    directionRef.current = window.mappls.direction(directionOptions);
                    setLoading(false);
                });

            } catch (err) {
                console.error('Map initialization error:', err);
                setError(err.message || 'Failed to initialize map');
                setLoading(false);
            }
        };

        // Small delay to ensure container is rendered
        const timer = setTimeout(initMap, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (mapRef.current) {
                try {
                    mapRef.current.remove();
                } catch (e) {}
            }
        };
    }, [isOpen, destination, profile]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '15px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    style={{
                        width: '100%',
                        maxWidth: '900px',
                        height: '85vh',
                        background: '#1a1a1a',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '15px 20px',
                        background: '#222',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px', borderRadius: '10px' }}>
                                <NavIcon size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Delivery Route</h3>
                                <p style={{ fontSize: '12px', color: '#888' }}>Order #{orderId?.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Map Body */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div id={MAP_CONTAINER_ID} style={{ width: '100%', height: '100%' }} />

                        {loading && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: '#1a1a1a',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(239, 68, 68, 0.1)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'lp-spin 1s linear infinite' }} />
                                <p style={{ marginTop: '15px', color: '#888', fontSize: '14px' }}>Calculating optimal route...</p>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: '#1a1a1a',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 11,
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '15px' }} />
                                <h3 style={{ color: 'white', marginBottom: '10px' }}>Navigation Error</h3>
                                <p style={{ color: '#888', maxWidth: '300px' }}>{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{ marginTop: '20px', background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Route Info Overlay */}
                        {routeInfo && !loading && (
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                background: 'rgba(26, 26, 26, 0.95)',
                                backdropFilter: 'blur(10px)',
                                padding: '15px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                minWidth: '180px',
                                zIndex: 5,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                            }}>
                                <p style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Estimated Trip</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <h4 style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>{routeInfo.duration} <span style={{ fontSize: '12px', fontWeight: '500', color: '#888' }}>min</span></h4>
                                        <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>{routeInfo.distance} km</p>
                                    </div>
                                    <div style={{ color: '#ef4444' }}>
                                        {profile === 'driving' && <Car size={24} />}
                                        {profile === 'biking' && <Bike size={24} />}
                                        {profile === 'walking' && <Footprints size={24} />}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls Footer */}
                    <div style={{
                        padding: '15px 20px',
                        background: '#222',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        {[
                            { id: 'driving', icon: <Car size={18} />, label: 'Car' },
                            { id: 'biking', icon: <Bike size={18} />, label: 'Bike' },
                            { id: 'walking', icon: <Footprints size={18} />, label: 'Walk' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setProfile(m.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    borderRadius: '12px',
                                    background: profile === m.id ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: profile === m.id ? 'white' : '#888',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {m.icon}
                                <span style={{ fontSize: '13px' }}>{m.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                <style>{`
                    @keyframes lp-spin { to { transform: rotate(360deg); } }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default DriverMapModal;
