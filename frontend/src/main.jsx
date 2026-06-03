import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Service Worker registration is handled in App.jsx to ensure proper Firebase configuration passage

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <NotificationProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </NotificationProvider>
    </AuthProvider>,
)
