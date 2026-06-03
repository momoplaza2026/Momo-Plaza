const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listUsers = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to Host: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        
        const users = await User.find({}, 'name email');
        console.log('--- USERS IN DATABASE ---');
        users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}`));
        console.log('------------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listUsers();
