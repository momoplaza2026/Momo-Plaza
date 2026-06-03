const axios = require('axios');

async function testSync() {
    try {
        console.log('Logging in...');
        const { data: authData } = await axios.post('http://localhost:5000/api/users/login', {
            email: 'test_debug@gmail.com',
            password: 'password123'
        });

        const token = authData.token;
        console.log('Login successful, token retrieved.');

        const cartItems = [
            { id: 'not-a-valid-id', qty: 2 } 
        ];

        console.log('Syncing cart...');
        const { data: syncData } = await axios.put('http://localhost:5000/api/users/cart', 
            { cartItems }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Sync result:', syncData);
    } catch (err) {
        console.error('Test failed:', err.response ? err.response.data : err.message);
    }
}

testSync();
