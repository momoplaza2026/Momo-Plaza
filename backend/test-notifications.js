const { sendNotificationToTopic, subscribeTokenToTopic } = require('./config/firebase');

(async () => {
    try {
        const testTopic = 'test-topic';
        const testToken = '<YOUR_TEST_DEVICE_TOKEN>'; // Replace with a valid FCM token

        // console.log('Testing subscription to topic...');
        await subscribeTokenToTopic(testToken, testTopic);

        // console.log('Testing notification sending...');
        const response = await sendNotificationToTopic(
            testTopic,
            'Test Notification',
            'This is a the notification from MealMatrix.',
            { key: 'value' },
            'https://cdn-icons-png.flaticon.com/512/1046/1046747.png'
        );

        // console.log('Notification response:', response);
    } catch (error) {
        console.error('Test failed:', error);
    }
})();