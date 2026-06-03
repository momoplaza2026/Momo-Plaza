import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { userInfo, setUserInfo } = useAuth();
    const isInitialMountRef = useRef(true);
    const skipSyncRef = useRef(false);
    const [cartItems, setCartItems] = useState(() => {
        // Synchronous initial load to prevent empty-cart-flicker on refresh
        const saved = localStorage.getItem('MomoPlaza_Cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const [appliedOffer, setAppliedOffer] = useState(() => {
        const saved = localStorage.getItem('appliedOffer');
        return saved ? JSON.parse(saved) : null;
    });

    const [discount, setDiscount] = useState(() => {
        const saved = localStorage.getItem('discount');
        return saved ? JSON.parse(saved) : 0;
    });

    const [couponLoading, setCouponLoading] = useState(false);

    const syncInProgress = useRef(false);
    const pendingSync = useRef(null);

    // Sync cart to server with concurrency control
    const syncCartToServer = async (items) => {
        if (!userInfo || !userInfo.token) return;
        
        // If a sync is already running, queue this one as "pending"
        if (syncInProgress.current) {
            pendingSync.current = items;
            return;
        }

        syncInProgress.current = true;
        try {
            const { data } = await axios.put('/api/users/cart', { cartItems: items }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            
            // Update userInfo in context with the new limit data AND current cart
            if (data.dailyAddItemCount !== undefined || data.cart) {
                const newUserInfo = { 
                    ...userInfo, 
                    dailyAddItemCount: data.dailyAddItemCount ?? userInfo.dailyAddItemCount, 
                    lastAddItemDate: data.lastAddItemDate ?? userInfo.lastAddItemDate,
                    cart: data.cart || userInfo.cart
                };
                localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
                setUserInfo(newUserInfo);
            }

            // Update local cart with server state (this handles availability updates)
            // CRITICAL: Only overwrite if there's no newer sync waiting in the queue
            if (data.cart && !pendingSync.current) {
                const serverCart = data.cart.map(item => {
                    if (!item.menuItem) {
                        return {
                            id: item._id,
                            name: 'Unknown Item',
                            isUnavailable: true,
                            qty: item.quantity,
                            price: 0
                        };
                    }
                    return {
                        ...item.menuItem,
                        id: item.menuItem._id,
                        qty: item.quantity,
                        isUnavailable: item.menuItem.isAvailable === false
                    };
                });
                // Prevent the next useEffect from triggering another server sync
                skipSyncRef.current = true;
                setCartItems(serverCart);
            }
        } catch (error) {
            // Don't log daily limit errors to console - they're expected and handled gracefully
            if (error.response?.status === 403 && error.response?.data?.limitReached) {
                // Daily limit reached - silently revert to server cart and show toast
                if (error.response.data.message) {
                    // The error is already handled by returning early above, no need to log
                }
            } else {
                console.error('Error syncing cart to server:', error);
            }
            if (error.response?.status === 403) {
                toast.error(error.response.data.message);
                // Trigger a refresh of the cart from server to "revert" illegal addition
                try {
                    const { data } = await axios.get('/api/users/profile', {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    });
                    const serverCart = Array.isArray(data?.cart) ? data.cart.map(item => {
                        if (!item.menuItem) {
                            return {
                                id: item._id, // fallback ID
                                name: 'Unknown Item',
                                isUnavailable: true,
                                qty: item.quantity,
                                price: 0
                            };
                        }
                        return {
                            ...item.menuItem,
                            id: item.menuItem._id,
                            qty: item.quantity,
                            isUnavailable: item.menuItem.isAvailable === false
                        };
                    }) : [];
                    skipSyncRef.current = true;
                    setCartItems(serverCart);
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                }
            }
        } finally {
            syncInProgress.current = false;
            // If another sync request came in while we were busy, run it now
            if (pendingSync.current) {
                const itemsToSync = pendingSync.current;
                pendingSync.current = null;
                syncCartToServer(itemsToSync);
            }
        }
    };

    // Sync state to LocalStorage (runs on every change)
    useEffect(() => {
        localStorage.setItem('MomoPlaza_Cart', JSON.stringify(cartItems));
        localStorage.setItem('discount', JSON.stringify(discount));
        if (appliedOffer) {
            localStorage.setItem('appliedOffer', JSON.stringify(appliedOffer));
        } else {
            localStorage.removeItem('appliedOffer');
        }
        
        // Only sync to server if logged in AND we're past the initial setup phase
        if (userInfo && !isInitialMountRef.current) {
            if (skipSyncRef.current) {
                skipSyncRef.current = false;
                return;
            }
            syncCartToServer(cartItems);
        }
    }, [cartItems, discount, appliedOffer, userInfo?._id]);

    // Handle Auth changes (Login/Logout)
    useEffect(() => {
        if (!userInfo) {
            // Optional: You might NOT want to clear it on logout if you want guest carts
            // But usually for a delivery app, logout = clear.
            setCartItems([]);
            setAppliedOffer(null);
            setDiscount(0);
            localStorage.removeItem('MomoPlaza_Cart');
            isInitialMountRef.current = true; // Reset flag on logout
        } else if (cartItems.length === 0 && userInfo.cart?.length > 0) {
            // Only pull from backend if our local state is empty
            const backendCart = userInfo.cart.map(item => {
                if (!item.menuItem) {
                    return {
                        id: item._id,
                        name: 'Unknown Item',
                        isUnavailable: true,
                        qty: item.quantity,
                        price: 0
                    };
                }
                return {
                    ...item.menuItem,
                    id: item.menuItem._id,
                    qty: item.quantity,
                    isUnavailable: item.menuItem.isAvailable === false
                };
            });
            setCartItems(backendCart);
        }
        // Mark initial mount as complete after auth is set up
        isInitialMountRef.current = false;
    }, [userInfo?._id]);

    // Recalculate discount when cart items change IF a coupon is applied
    useEffect(() => {
        if (appliedOffer && cartItems.length > 0) {
            const currentItemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
            
            // Check if cart still meets minimum order
            if (currentItemsPrice < appliedOffer.minOrderAmount) {
                setAppliedOffer(null);
                setDiscount(0);
                toast.error('Coupon removed: Cart total dropped below minimum order amount');
                return;
            }

            // Recalculate discount
            let newDiscount = 0;
            if (appliedOffer.discountType === 'percentage') {
                newDiscount = (currentItemsPrice * appliedOffer.discountValue) / 100;
                if (appliedOffer.maxDiscount !== null && newDiscount > appliedOffer.maxDiscount) {
                    newDiscount = appliedOffer.maxDiscount;
                }
            } else {
                newDiscount = appliedOffer.discountValue;
            }
            if (newDiscount > currentItemsPrice) {
                newDiscount = currentItemsPrice;
            }
            setDiscount(Number(newDiscount.toFixed(2)));
        } else if (cartItems.length === 0 && appliedOffer) {
            setAppliedOffer(null);
            setDiscount(0);
        }
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems((prev) => {
            const existItem = prev.find((x) => String(x.id) === String(item.id));

            if (existItem) {
                toast.success(`Increased ${item.name} quantity`);
                return prev.map((x) =>
                    String(x.id) === String(existItem.id) ? { ...existItem, qty: existItem.qty + 1 } : x
                );
            } else {
                toast.success(`${item.name} added to cart!`);
                return [...prev, { ...item, qty: 1 }];
            }
        });
    };

    // Add item via AI chatbot (applies daily limit)
    const addToCartViaAI = (item) => {
        // Check Daily Limit BEFORE attempting to add
        if (userInfo) {
            const existItem = cartItems.find((x) => String(x.id) === String(item.id));
            if (!existItem) {
                const today = new Date().setHours(0, 0, 0, 0);
                const lastAdd = userInfo.lastAddItemDate ? new Date(userInfo.lastAddItemDate).setHours(0, 0, 0, 0) : null;
                
                if (lastAdd === today && userInfo.dailyAddItemCount >= 1) {
                    toast.error("Daily Limit: AI can only recommend 1 new item per day! 🧞‍♂️");
                    return { success: false, reason: 'daily_limit' };
                }
            }
        }

        setCartItems((prev) => {
            const existItem = prev.find((x) => String(x.id) === String(item.id));

            if (existItem) {
                toast.success(`Increased ${item.name} quantity`);
                return prev.map((x) =>
                    String(x.id) === String(existItem.id) ? { ...existItem, qty: existItem.qty + 1 } : x
                );
            } else {
                toast.success(`${item.name} added to cart via AI recommendation!`);
                // Mark this item as added via AI
                return [...prev, { ...item, qty: 1, addedViaAI: true }];
            }
        });
        return { success: true };
    };

    const removeFromCart = (id) => {
        setCartItems((prev) => {
            const itemToRemove = prev.find(x => String(x.id) === String(id));
            if (itemToRemove) toast.error(`${itemToRemove.name} removed`);
            return prev.filter((x) => String(x.id) !== String(id));
        });
    };

    const updateQty = (id, qty) => {
        if (qty < 1) return;
        setCartItems((prev) =>
            prev.map((x) => (String(x.id) === String(id) ? { ...x, qty } : x))
        );
        toast.success(`Quantity updated`);
    };

    const clearCart = () => {
        setCartItems([]);
        setAppliedOffer(null);
        setDiscount(0);
    };

    const applyCoupon = async (code) => {
        if (!userInfo || !userInfo.token) {
            toast.error('Please login to apply coupon');
            return false;
        }

        setCouponLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post('/api/offers/apply', {
                code,
                cartTotal: itemsPrice
            }, config);

            setAppliedOffer({
                ...data.offer,
                minOrderAmount: 0 // we already validated server-side
            });
            setDiscount(data.discount);
            toast.success(data.message);
            return true;
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to apply coupon';
            toast.error(msg);
            return false;
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedOffer(null);
        setDiscount(0);
        toast.success('Coupon removed');
    };

    const refreshCart = async () => {
        if (!userInfo || !userInfo.token) return;
        try {
            const { data } = await axios.get('/api/users/profile', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            if (data.cart) {
                const serverCart = data.cart.map(item => {
                    if (!item.menuItem) {
                        return {
                            id: item._id,
                            name: 'Unknown Item',
                            isUnavailable: true,
                            qty: item.quantity,
                            price: 0
                        };
                    }
                    return {
                        ...item.menuItem,
                        id: item.menuItem._id,
                        qty: item.quantity,
                        isUnavailable: item.menuItem.isAvailable === false
                    };
                });
                setCartItems(serverCart);
            }
        } catch (err) {
            console.error('Error refreshing cart:', err);
        }
    };

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 500 ? 0 : 40;
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice - discount).toFixed(2));

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            addToCartViaAI,
            removeFromCart,
            updateQty,
            clearCart,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            // Coupon/offer related
            appliedOffer,
            discount,
            couponLoading,
            applyCoupon,
            removeCoupon,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
