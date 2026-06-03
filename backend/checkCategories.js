const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('./models/Menu');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27014/food-delivery')
    .then(async () => {
        const categories = await Menu.distinct('category');
        console.log('Unique Categories:', categories);
        console.log('Count:', categories.length);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
