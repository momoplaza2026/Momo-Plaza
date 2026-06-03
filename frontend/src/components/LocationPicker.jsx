import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation as NavIcon, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MAP_CONTAINER_ID = 'mappls-map-container';

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ─── Blue Google-style Pin SVG ───────────────────────────────────────────── */
const BluePinIcon = ({ lifted }) => (
    <svg
        width="48" height="64"
        viewBox="0 0 48 64"
        xmlns="http://www.w3.org/2000/svg"
        style={{
            filter: lifted
                ? 'drop-shadow(0 10px 18px rgba(66,133,244,0.55))'
                : 'drop-shadow(0 4px 8px rgba(66,133,244,0.4))',
            transition: 'filter 0.2s'
        }}
    >
        {/* Pin body */}
        <path
            d="M24 0C10.75 0 0 10.75 0 24c0 16.5 24 40 24 40S48 40.5 48 24C48 10.75 37.25 0 24 0z"
            fill="#4285F4"
        />
        {/* Shine highlight */}
        <path
            d="M24 2C11.85 2 2 11.85 2 24c0 6.4 2.6 12.2 6.8 16.4L24 2z"
            fill="rgba(255,255,255,0.18)"
        />
        {/* Outer white ring */}
        <circle cx="24" cy="24" r="11" fill="rgba(255,255,255,0.2)" />
        {/* White filled circle */}
        <circle cx="24" cy="24" r="8" fill="white" />
        {/* Blue centre dot */}
        <circle cx="24" cy="24" r="4.5" fill="#4285F4" />
    </svg>
);

/* ─── Pulsing shadow dot on the ground ───────────────────────────────────── */
const GroundDot = ({ visible }) => (
    <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, 10px)',
        pointerEvents: 'none',
        zIndex: 24,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s'
    }}>
        <div style={{
            width: '14px', height: '6px',
            background: 'rgba(0,0,0,0.28)',
            borderRadius: '50%',
            filter: 'blur(2px)'
        }} />
    </div>
);

const LocationPicker = ({ onLocationSelect, onClose }) => {
    const mapInstanceRef = useRef(null);
    const tokenRef       = useRef(null);

    const [initStatus,       setInitStatus]       = useState('loading');
    const [errorMsg,         setErrorMsg]         = useState('');
    const [isPanning,        setIsPanning]        = useState(false);
    const [previewAddress,   setPreviewAddress]   = useState(null);
    const [locating,         setLocating]         = useState(false);
    const [geocoding,        setGeocoding]        = useState(false);

    /* ─── Reverse geocode ──────────────────────────────────────────────────── */
    const reverseGeocode = useCallback(async (lat, lng) => {
        setGeocoding(true);
        // Don't clear previewAddress immediately to keep the button enabled 
        // until the new address is ready (smoother UX)
        try {
            const { data } = await axios.get('/api/mappls/reverse-geocode', {
                params: { lat, lng }
            });
            setPreviewAddress({
                address:  data.formatted_address || data.address || '',
                city:     data.city    || '',
                pincode:  data.pincode || '',
                lat, lng
            });
        } catch {
            setPreviewAddress({
                address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                city: '', pincode: '', lat, lng
            });
        } finally {
            setGeocoding(false);
        }
    }, []);

    /* ─── Map init ─────────────────────────────────────────────────────────── */
    useEffect(() => {
        let isMounted = true;

        const initMap = async () => {
            try {
                const { data } = await axios.get('/api/mappls/token');
                tokenRef.current = data.access_token;
                if (!isMounted) return;

                if (!window.mappls?.Map) throw new Error('Mappls SDK not loaded.');

                // Load plugins
                await new Promise((resolve, reject) => {
                    if (window.mappls.placePicker) { resolve(); return; }
                    const old = document.getElementById('mappls-plugins-script');
                    if (old) old.remove();
                    const s = document.createElement('script');
                    s.id = 'mappls-plugins-script';
                    s.src = `https://apis.mappls.com/advancedmaps/api/${tokenRef.current}/map_sdk_plugins?v=3.0&js=placePicker`;
                    s.onload = resolve;
                    s.onerror = () => reject(new Error('Failed to load plugins'));
                    document.head.appendChild(s);
                });
                if (!isMounted) return;

                await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                if (!isMounted) return;

                if (!document.getElementById(MAP_CONTAINER_ID)) throw new Error('Map container not found.');

                const CENTER = [77.5946, 12.9716];
                const ZOOM   = 14;

                const mapInst = new window.mappls.Map(MAP_CONTAINER_ID, {
                    center: CENTER,
                    zoom:   ZOOM,
                    styles: 'vector'
                });
                mapInstanceRef.current = mapInst;

                if (isMounted) setInitStatus('ready');

                // Kickstart tile rendering
                const kick = () => {
                    if (!mapInstanceRef.current) return;
                    try { mapInst.resize?.(); } catch (_) {}
                    try { mapInst.setCenter?.(CENTER); mapInst.setZoom?.(ZOOM); } catch (_) {}
                };
                setTimeout(kick, 200);
                setTimeout(kick, 600);
                setTimeout(kick, 1200);

                // Wire panning events
                const onMapLoad = () => {
                    if (!isMounted) return;
                    try { mapInst.resize?.(); } catch (_) {}

                    const getCenter = () => {
                        try {
                            const c = mapInst.getCenter?.();
                            if (!c) return null;
                            return { lat: c.lat ?? c.latitude ?? c[1], lng: c.lng ?? c.longitude ?? c[0] };
                        } catch { return null; }
                    };

                    const debouncedGeo = debounce(async () => {
                        if (!isMounted) return;
                        setIsPanning(false);
                        const center = getCenter();
                        if (center?.lat && center?.lng) reverseGeocode(center.lat, center.lng);
                    }, 700);

                    if (mapInst.on) {
                        mapInst.on('movestart', () => { if (isMounted) setIsPanning(true); });
                        mapInst.on('moveend',   debouncedGeo);
                    } else if (mapInst.addListener) {
                        mapInst.addListener('movestart', () => { if (isMounted) setIsPanning(true); });
                        mapInst.addListener('moveend',   debouncedGeo);
                    }

                    // Geocode initial center
                    const c = getCenter();
                    if (c?.lat && c?.lng) reverseGeocode(c.lat, c.lng);
                };

                if (mapInst.on) mapInst.on('load', onMapLoad);
                else if (mapInst.addListener) mapInst.addListener('load', onMapLoad);
                else setTimeout(onMapLoad, 1500);

            } catch (err) {
                console.error('Map init:', err);
                if (isMounted) { setErrorMsg(err.message); setInitStatus('error'); }
            }
        };

        initMap();
        return () => {
            isMounted = false;
            try { mapInstanceRef.current?.remove?.(); } catch (_) {}
            mapInstanceRef.current = null;
        };
    }, [reverseGeocode]);
    
    // Forced resize logic to fix blank map on desktop
    useEffect(() => {
        if (initStatus === 'ready' && mapInstanceRef.current) {
            // Multiple kicks during potential animation window
            const kicks = [100, 300, 600, 1000, 2000];
            const timers = kicks.map(delay => setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.resize?.();
                    // Forced refresh of tiles
                    const center = mapInstanceRef.current.getCenter?.();
                    if (center) mapInstanceRef.current.setCenter?.(center);
                }
            }, delay));
            return () => timers.forEach(t => clearTimeout(t));
        }
    }, [initStatus]);

    /* ─── Live location ────────────────────────────────────────────────────── */
    const handleLiveLocation = () => {
        if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                setLocating(false);
                try {
                    mapInstanceRef.current?.setCenter?.([longitude, latitude]);
                    mapInstanceRef.current?.setZoom?.(17);
                    
                    // Explicitly trigger pinpoint detection (reverse geocode)
                    // so the address card updates immediately.
                    reverseGeocode(latitude, longitude);
                } catch (_) {}
            },
            (err) => {
                setLocating(false);
                alert(err.code === 1
                    ? 'Location access denied. Allow in browser settings.'
                    : 'Could not get location. Try again.');
            },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    const handleConfirm = () => {
        if (previewAddress) onLocationSelect(previewAddress);
    };

    const canConfirm = !!previewAddress && !isPanning;
    const isWorking  = geocoding || isPanning;

    return (
        <>
            <style>{`
                @keyframes lp-spin { to { transform: rotate(360deg); } }
                @keyframes lp-pulse {
                    0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.7; }
                    70%  { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
                    100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
                }
                @keyframes lp-pinbounce {
                    0%,100% { transform: translate(-50%, -100%) translateY(0); }
                    50%     { transform: translate(-50%, -100%) translateY(-6px); }
                }

                .lp-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.7);
                    z-index: 9999;
                    display: flex; align-items: flex-end; justify-content: center;
                    backdrop-filter: blur(6px);
                    padding-bottom: env(safe-area-inset-bottom, 0);
                }
                .lp-sheet {
                    width: 100%; max-width: 860px;
                    height: 96dvh; /* Increased slightly */
                    background: #f8f9fa;
                    border-radius: 20px 20px 0 0;
                    display: flex; flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 -12px 50px rgba(0,0,0,0.5);
                    position: relative;
                }
                @media (min-width: 640px) {
                    .lp-overlay { align-items: center; padding: 16px; }
                    .lp-sheet   { border-radius: 20px; height: 90vh; max-height: 720px; }
                }

                /* ── Top bar ── */
                .lp-topbar {
                    background: white;
                    padding: 12px 14px 10px;
                    display: flex; align-items: center; gap: 10px;
                    border-bottom: 1px solid #e8eaed;
                    flex-shrink: 0;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                    z-index: 10;
                }
                .lp-search-pill {
                    flex: 1;
                    background: #f1f3f4;
                    border-radius: 24px;
                    display: flex; align-items: center; gap: 8px;
                    padding: 9px 14px;
                    cursor: default;
                }
                .lp-search-text {
                    color: #5f6368; font-size: 14px; font-weight: 400;
                    line-height: 1;
                }
                .lp-x-btn {
                    background: #f1f3f4; border: none; border-radius: 50%;
                    width: 34px; height: 34px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #5f6368; transition: background 0.15s;
                }
                .lp-x-btn:hover { background: #e8eaed; }

                /* ── Map area ── */
                .lp-map-wrap {
                    flex: 1; position: relative; overflow: hidden; min-height: 250px;
                    background: #e8edf0;
                }
                #mappls-map-container {
                    position: absolute; inset: 0;
                }

                /* ── Centre pin wrapper ── */
                .lp-pin-wrap {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -100%);
                    z-index: 25;
                    pointer-events: none;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
                }
                .lp-pin-wrap.panning {
                    transform: translate(-50%, -120%);
                }

                /* Pulse ring */
                .lp-pulse-ring {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    background: rgba(66,133,244,0.4);
                    animation: lp-pulse 1.8s ease-out infinite;
                    z-index: 0;
                }

                /* ── Ground shadow dot ── */
                .lp-shadow-dot {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, 2px);
                    width: 16px; height: 7px;
                    background: rgba(0,0,0,0.22);
                    border-radius: 50%;
                    filter: blur(2px);
                    z-index: 24;
                    pointer-events: none;
                    transition: all 0.18s;
                }
                .lp-shadow-dot.panning {
                    width: 10px; height: 4px;
                    opacity: 0.4;
                    filter: blur(3px);
                    transform: translate(-50%, 8px);
                }

                /* ── My Location FAB ── */
                .lp-fab {
                    position: absolute;
                    right: 12px;
                    z-index: 25;
                    width: 44px; height: 44px;
                    background: white;
                    border: none; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04);
                    transition: box-shadow 0.2s;
                }
                .lp-fab:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
                .lp-fab:disabled { opacity: 0.5; cursor: not-allowed; }
                .lp-fab-spin {
                    width: 18px; height: 18px;
                    border: 2.5px solid rgba(66,133,244,0.25);
                    border-top-color: #4285F4;
                    border-radius: 50%;
                    animation: lp-spin 0.8s linear infinite;
                }

                /* ── Bottom address card ── */
                .lp-bottom-card {
                    background: white;
                    border-top: 1px solid #e8eaed;
                    flex-shrink: 0;
                    box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
                    z-index: 100;
                    position: relative;
                }
                .lp-addr-inner {
                    padding: 14px 14px 10px;
                    display: flex; align-items: flex-start; gap: 11px;
                }
                .lp-addr-dot {
                    flex-shrink: 0; margin-top: 2px;
                    width: 32px; height: 32px; border-radius: 50%;
                    background: #e8f0fe;
                    display: flex; align-items: center; justify-content: center;
                }
                .lp-addr-body { flex: 1; min-width: 0; }
                .lp-addr-label {
                    font-size: 10px; font-weight: 700;
                    letter-spacing: 0.8px; margin-bottom: 3px;
                }
                .lp-addr-main {
                    font-size: 14px; font-weight: 500; color: #202124;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    line-height: 1.3;
                }
                .lp-addr-sub { font-size: 12px; color: #5f6368; margin-top: 2px; }

                /* Confirm button */
                .lp-confirm-row {
                    padding: 0 14px 24px; /* Increased bottom padding for mobile safe area */
                }
                .lp-confirm-btn {
                    width: 100%;
                    min-height: 52px; /* Ensure good touch target */
                    background: #4285F4;
                    color: white; border: none; border-radius: 12px;
                    padding: 14px;
                    font-size: 16px; font-weight: 600;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(66,133,244,0.4);
                    -webkit-tap-highlight-color: transparent;
                }
                .lp-confirm-btn:hover:not(:disabled) { background: #3367d6; transform: translateY(-1px); }
                .lp-confirm-btn:active:not(:disabled) { transform: translateY(1px) scale(0.98); }
                .lp-confirm-btn:disabled {
                    background: #dadce0; color: #9aa0a6;
                    box-shadow: none; cursor: not-allowed;
                }

                /* Loading / error overlays */
                .lp-init-cover {
                    position: absolute; inset: 0; z-index: 10;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    background: #e8edf0;
                }
                .lp-big-spin {
                    width: 40px; height: 40px;
                    border: 3.5px solid rgba(66,133,244,0.15);
                    border-top-color: #4285F4;
                    border-radius: 50%;
                    animation: lp-spin 0.9s linear infinite;
                }
            `}</style>

            {/* ── Backdrop ── */}
            <motion.div
                className="lp-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    className="lp-sheet"
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0,  opacity: 1 }}
                    exit={{ y: 40,  opacity: 0 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                >
                    {/* ── Top bar (Google Maps style) ── */}
                    <div className="lp-topbar">
                        <div className="lp-search-pill">
                            <Search size={16} color="#5f6368" />
                            <span className="lp-search-text">Move map to select delivery location</span>
                        </div>
                        <button className="lp-x-btn" onClick={onClose} aria-label="Close">
                            <X size={17} />
                        </button>
                    </div>

                    {/* ── Map ── */}
                    <div className="lp-map-wrap">
                        <div id={MAP_CONTAINER_ID} />

                        {/* Init spinner */}
                        {initStatus === 'loading' && (
                            <div className="lp-init-cover">
                                <div className="lp-big-spin" />
                                <p style={{ marginTop: 14, color: '#80868b', fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>
                                    LOADING MAP…
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {initStatus === 'error' && (
                            <div className="lp-init-cover" style={{ background: '#fff' }}>
                                <MapPin size={44} color="#4285F4" style={{ marginBottom: 14 }} />
                                <p style={{ color: '#202124', fontWeight: 600, marginBottom: 6, fontSize: 16 }}>
                                    Couldn't load map
                                </p>
                                <p style={{ color: '#5f6368', fontSize: 13, maxWidth: 280, textAlign: 'center', lineHeight: 1.5 }}>
                                    {errorMsg}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        marginTop: 18, padding: '10px 24px',
                                        background: '#4285F4', border: 'none', borderRadius: 10,
                                        color: 'white', fontWeight: 600, cursor: 'pointer',
                                        fontSize: 14
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {initStatus === 'ready' && (
                            <>
                                {/* Ground shadow dot */}
                                <div className={`lp-shadow-dot${isPanning ? ' panning' : ''}`} />

                                {/* Centre pin */}
                                <div className={`lp-pin-wrap${isPanning ? ' panning' : ''}`}>
                                    {/* Pulse ring (only when still) */}
                                    {!isPanning && <div className="lp-pulse-ring" />}
                                    <BluePinIcon lifted={isPanning} />
                                </div>

                                {/* My Location FAB (bottom-right, above card) */}
                                <button
                                    className="lp-fab"
                                    style={{ bottom: previewAddress ? '14px' : '14px' }}
                                    onClick={handleLiveLocation}
                                    disabled={locating}
                                    title="Use my location"
                                >
                                    {locating
                                        ? <div className="lp-fab-spin" />
                                        : <NavIcon size={20} color="#4285F4" />
                                    }
                                </button>
                            </>
                        )}
                    </div>

                    {/* ── Bottom address card ── */}
                    <AnimatePresence>
                        {initStatus === 'ready' && (previewAddress || geocoding) && (
                            <motion.div
                                className="lp-bottom-card"
                                initial={{ y: 80, opacity: 0 }}
                                animate={{ y: 0,  opacity: 1 }}
                                exit={{ y: 80, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            >
                                <div className="lp-addr-inner">
                                    {/* Blue dot icon */}
                                    <div className="lp-addr-dot">
                                        {isWorking
                                            ? <div style={{
                                                width: 16, height: 16,
                                                border: '2.5px solid rgba(66,133,244,0.2)',
                                                borderTopColor: '#4285F4',
                                                borderRadius: '50%',
                                                animation: 'lp-spin 0.8s linear infinite'
                                              }} />
                                            : <MapPin size={16} color="#4285F4" fill="#c5d9fc" />
                                        }
                                    </div>

                                    <div className="lp-addr-body">
                                        <div className="lp-addr-label" style={{
                                            color: isWorking ? '#9aa0a6' : '#4285F4'
                                        }}>
                                            {geocoding ? 'FINDING ADDRESS…'
                                             : isPanning ? 'MOVE TO PINPOINT…'
                                             : 'DROP OFF HERE'}
                                        </div>

                                        {previewAddress && (
                                            <>
                                                <div className="lp-addr-main">
                                                    {previewAddress.address || '—'}
                                                </div>
                                                {(previewAddress.city || previewAddress.pincode) && (
                                                    <div className="lp-addr-sub">
                                                        {[previewAddress.city, previewAddress.pincode]
                                                            .filter(Boolean).join(' · ')}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {!previewAddress && geocoding && (
                                            <div className="lp-addr-main" style={{ color: '#9aa0a6' }}>
                                                Fetching address…
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Confirm button */}
                                <div className="lp-confirm-row" style={{ paddingBottom: '100px' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        className="lp-confirm-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Confirm button clicked!', previewAddress);
                                            if (!previewAddress) {
                                                console.error('No preview address to confirm');
                                                return;
                                            }
                                            toast.success('Location pinpointed!');
                                            handleConfirm();
                                        }}
                                        disabled={!canConfirm}
                                        style={{ 
                                            pointerEvents: 'auto', 
                                            position: 'relative',
                                            zIndex: 2147483647 // Maximum 32-bit integer z-index
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        Confirm Delivery Location
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </>
    );
};

export default LocationPicker;
