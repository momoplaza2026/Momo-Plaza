import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBPC3eojJtW60Jj47wAp2gAlCdyLO76Hhk",
  authDomain: "credit-235dd.firebaseapp.com",
  projectId: "credit-235dd",
  storageBucket: "credit-235dd.firebasestorage.app",
  messagingSenderId: "1068587415705",
  appId: "1:1068587415705:web:1140d97921ad2f742c6008"
};

// Validate Config
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'undefined') {
    console.error('❌ CRITICAL: Firebase PROJECT_ID is missing! Notifications will not work.');
    console.warn('💡 Ensure VITE_FIREBASE_PROJECT_ID is set in your Vercel Environment Variables.');
}

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async (registration) => {
  try {
    const permission = await Notification.requestPermission();
    // console.log('Notification permission status:', permission);
    
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { 
        vapidKey: "BA8hTLUK55fUl_D00qbpauHID8OJHki4-V3Nyl3KEAckiQjvL3lc80f7-K4SLB_NMpwfA0UlLoEOKDTWu6qUnZY",
        serviceWorkerRegistration: registration // CRITICAL: Link token to our custom SW
      });
      if (currentToken) {
        return currentToken;
      }
    } else {
      // console.warn('❌ Notification permission denied');
    }
  } catch (err) {
    // console.error('❌ Error retrieving token:', err);
  }
};

export const onMessageListener = (callback) => {
    onMessage(messaging, (payload) => {
        // console.log("📲 Foreground message received:", payload);
        
        const { title, body, image } = payload.notification || {};
        
        if (Notification.permission === 'granted') {
            const notificationTitle = title || 'Order Update';
            const notificationOptions = {
                body: body || 'New message from Momo Plaza',
                icon: 'https://cdn-icons-png.flaticon.com/512/1046/1046747.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/1046/1046747.png',
                image: image || payload.data?.image || 'https://cdn-icons-png.flaticon.com/512/1046/1046747.png',
                tag: 'food-delivery',
                requireInteraction: true,
                data: {
                    ...payload.data,
                    click_action: payload.data?.click_action || window.location.origin
                }
            };

            // console.log("🔔 Attempting to show browser notification:", notificationTitle);

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(notificationTitle, notificationOptions)
                        .then(() => console.log("✅ Browser notification shown via SW"))
                        .catch(err => console.error("❌ SW showNotification failed:", err));
                });
            } else {
                // console.log("📣 Falling back to new Notification()");
                try {
                    const n = new Notification(notificationTitle, notificationOptions);
                    n.onclick = (e) => {
                        e.preventDefault();
                        window.focus();
                        n.close();
                    };
                } catch (err) {
                    // console.error("❌ new Notification() failed:", err);
                }
            }
        } else {
            // console.warn("⚠️ Notification permission not granted. Status:", Notification.permission);
        }
        
        if (callback) callback(payload);
    });
};
