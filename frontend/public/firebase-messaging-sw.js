// SW Version: v8 - Detailed logging for debugging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const urlParams = new URL(self.location).searchParams;
const firebaseConfig = {
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId')
};

// Only initialize if we have the config
if (firebaseConfig.projectId && firebaseConfig.projectId !== 'null') {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('[SW] Firebase initialized with config from URL');
        
        const messaging = firebase.messaging();
        
        messaging.onBackgroundMessage((payload) => {
          console.log('[SW] Background message received:', payload);
          const notificationTitle = payload.notification?.title || 'Order Update';
          const notificationOptions = {
            body: payload.notification?.body || 'You have a new notification',
            icon: 'https://cdn-icons-png.flaticon.com/512/1046/1046747.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/1046/1046747.png',
            image: payload.notification?.image || 'https://cdn-icons-png.flaticon.com/512/1046/1046747.png',
            data: payload.data || {},
            tag: 'food-delivery',
            renotify: true,
            requireInteraction: true,
            vibrate: [200, 100, 200]
          };
        
          return self.registration.showNotification(notificationTitle, notificationOptions);
        });

        self.addEventListener('notificationclick', (event) => {
            console.log('[SW] Notification clicked:', event.notification);
            event.notification.close();
            const urlToOpen = event.notification.data?.click_action || '/';
            event.waitUntil(
                self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                    for (let client of windowClients) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (self.clients.openWindow) {
                        return self.clients.openWindow(urlToOpen);
                    }
                })
            );
        });
    } catch (error) {
        console.error('[SW] Firebase init error:', error);
    }
} else {
    console.warn('[SW] No Firebase config found in URL. Background notifications disabled.');
}
