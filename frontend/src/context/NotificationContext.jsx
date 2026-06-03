import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { userInfo } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const fetchUnreadCount = useCallback(async () => {
        if (!userInfo?.token) {
            setUnreadCount(0);
            return;
        }
        try {
            const { data } = await axios.get('/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, [userInfo]);

    const fetchNotifications = useCallback(async () => {
        if (!userInfo?.token) {
            setNotifications([]);
            return;
        }
        try {
            const { data } = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [userInfo]);

    const markAsRead = useCallback(async (id) => {
        if (!userInfo?.token) return;
        try {
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }, [userInfo]);

    const markAllAsRead = useCallback(async () => {
        if (!userInfo?.token) return;
        try {
            await axios.put('/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    }, [userInfo]);

    // Poll for unread count every 30 seconds
    useEffect(() => {
        if (!userInfo) return;
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [userInfo, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            notifications,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
