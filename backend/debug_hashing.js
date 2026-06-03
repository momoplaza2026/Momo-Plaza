const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'test_debug@gmail.com';
        await User.deleteMany({ email });

        console.log('Creating test user...');
        const user = await User.create({
            name: 'Debug User',
            email: email,
            password: 'password123'
        });
        console.log('User created:', user._id);

        const foundUser = await User.findById(user._id);
        console.log('Password in DB:', foundUser.password);

        const isMatch = await foundUser.matchPassword('password123');
        console.log('Match with "password123":', isMatch);

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

testUser();
