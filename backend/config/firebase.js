const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

// 1. Try to load from environment variable (Best for Render/Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        // console.log('📦 Firebase Admin: Loading from environment variable');
    } catch (err) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
    }
}

// 2. Fallback to local file search if not in env
if (!serviceAccount) {
    try {
        const files = fs.readdirSync(path.join(__dirname, '..'));
        const serviceAccountFile = files.find(f => f.startsWith('credit-235dd-firebase-adminsdk') && f.endsWith('.json'));
        if (serviceAccountFile) {
            const serviceAccountPath = path.join(__dirname, '..', serviceAccountFile);
            serviceAccount = require(serviceAccountPath);
            // console.log(`📂 Firebase Admin: Loading from local file: ${serviceAccountFile}`);
        }
    } catch (err) {
        // Silently fail file search as it might be production
    }
}

// 3. Initialize if valid
if (serviceAccount) {
    const isPlaceholder = !serviceAccount.private_key || 
                        serviceAccount.private_key === '<PRIVATE_KEY>' || 
                        serviceAccount.project_id === '<PROJECT_ID>';

    if (isPlaceholder) {
        // console.error('════════════════════════════════════════════════════════════════════');
        // console.error('❌ CRITICAL FIREBASE ERROR: Service account contains placeholders.');
        // console.error('💡 Please provide real keys in FIREBASE_SERVICE_ACCOUNT env var or the JSON file.');
        // console.error('════════════════════════════════════════════════════════════════════');
    } else {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            // console.log('✅ Firebase Admin initialized successfully');
        }
    }
} else {
    // console.warn('════════════════════════════════════════════════════════════════════');
    // console.warn('⚠️ WARNING: Firebase Service Account NOT found (Env or File).');
    // console.warn('📬 Push notifications are disabled.');
    // console.warn('════════════════════════════════════════════════════════════════════');
}

const sendNotificationToTopic = async (topic, title, body, data = {}, image = null) => {
    if (!admin.apps.length) {
        console.error('Firebase Admin SDK is not initialized. Notifications cannot be sent.');
        return;
    }

    // console.log(`Preparing to send notification to topic: ${topic}`);

    const message = {
        notification: {
            title,
            body
        },
        data: {
            ...data,
            title,
            body,
            click_action: process.env.FRONTEND_URL || 'https://meal-matrix-sigma.vercel.app/',
        },
        webpush: {
            fcmOptions: {
                link: process.env.FRONTEND_URL || 'https://meal-matrix-sigma.vercel.app/'
            },
            headers: {
                TTL: '3600'
            }
        },
        topic
    };

    try {
        console.log('Sending notification with message:', JSON.stringify(message, null, 2));
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

const subscribeTokenToTopic = async (token, topic) => {
    if (!admin.apps.length) {
        console.error('Firebase Admin SDK is not initialized. Cannot subscribe token to topic.');
        return;
    }

    // console.log(`Subscribing token: ${token} to topic: ${topic}`);

    try {
        const response = await admin.messaging().subscribeToTopic(token, topic);
        console.log(`Successfully subscribed to ${topic}:`, response);
        return response;
    } catch (error) {
        console.error(`Error subscribing to ${topic}:`, error);
        throw error;
    }
};

module.exports = { admin, sendNotificationToTopic, subscribeTokenToTopic };
