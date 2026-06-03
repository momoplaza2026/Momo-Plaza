const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27014/food-delivery')
    .then(async () => {
        const users = await User.find({}, 'name email isAdmin');
        console.log('Users:', users);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
