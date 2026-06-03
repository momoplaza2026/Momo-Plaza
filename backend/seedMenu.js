const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('./models/Menu');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27014/food-delivery')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const menuItems = [
    { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Chicken Tikka Masala', category: 'Main Course', price: 320, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.9 },
    { name: 'Dal Makhani', category: 'Main Course', price: 240, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 },
    { name: 'Hyderabadi Biryani', category: 'Main Course', price: 350, img: 'https://images.unsplash.com/photo-1563379091339-0ca4b82183cb?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.9 },
    { name: 'Veg Hakka Noodles', category: 'Chinese', price: 220, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Chicken Fried Rice', category: 'Chinese', price: 260, img: 'https://images.unsplash.com/photo-1603133872878-684f20830cb3?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.6 },
    { name: 'Margherita Pizza', category: 'Main Course', price: 350, img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Pepperoni Pizza', category: 'Main Course', price: 450, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.7 },
    { name: 'Veg Burger', category: 'Starters', price: 150, img: 'https://images.unsplash.com/photo-1520072959219-c595ca870360?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.4 },
    { name: 'Cheese Chicken Burger', category: 'Starters', price: 200, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.7 },
    { name: 'Classic Mojito', category: 'Beverages', price: 120, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Chocolate Milkshake', category: 'Beverages', price: 180, img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.9 },
    { name: 'Masala Dosa', category: 'Main Course', price: 180, img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Idli Sambhar', category: 'Main Course', price: 120, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Butter Naan', category: 'Main Course', price: 60, img: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 },
    { name: 'Garlic Naan', category: 'Main Course', price: 80, img: 'https://images.unsplash.com/photo-1601000919793-019bb1ce1223?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Gulab Jamun', category: 'Desserts', price: 90, img: 'https://images.unsplash.com/photo-1589119908995-c6800ffca392?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.9 },
    { name: 'Rasmalai', category: 'Desserts', price: 110, img: 'https://images.unsplash.com/photo-1644722521990-2e40f35359cd?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Aloo Paratha', category: 'Main Course', price: 120, img: 'https://images.unsplash.com/photo-1601050690597-df056fb1d745?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Puri Sabji', category: 'Main Course', price: 130, img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380ee2?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Tandoori Chicken', category: 'Starters', price: 450, img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.9 },
    { name: 'Paneer Tikka', category: 'Starters', price: 300, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Gyoza', category: 'Starters', price: 250, img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 },
    { name: 'Sushi Platter', category: 'Chinese', price: 850, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.9 },
    { name: 'Greek Salad', category: 'Starters', price: 180, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.4 },
    { name: 'French Fries', category: 'Starters', price: 100, img: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'White Sauce Pasta', category: 'Main Course', price: 280, img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 },
    { name: 'Arrabiata Pasta', category: 'Main Course', price: 260, img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Mutton Rogan Josh', category: 'Main Course', price: 550, img: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.9 },
    { name: 'Fish Curry', category: 'Main Course', price: 420, img: 'https://images.unsplash.com/photo-1626509653297-fa656a3c73e0?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.7 },
    { name: 'Iced Tea', category: 'Beverages', price: 90, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.3 },
    { name: 'Cold Coffee', category: 'Beverages', price: 150, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Manchow Soup', category: 'Starters', price: 140, img: 'https://images.unsplash.com/photo-1547592110-803f295252ad?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Spring Rolls', category: 'Starters', price: 180, img: 'https://images.unsplash.com/photo-1606331102432-849a997d8481?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Garlic Bread with Cheese', category: 'Starters', price: 160, img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 },
    { name: 'Crispy Corn', category: 'Starters', price: 220, img: 'https://images.unsplash.com/photo-1528279027-68f0d7fce9f1?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Chicken Wings', category: 'Starters', price: 280, img: 'https://images.unsplash.com/photo-1527477396000-dcbd9a27c00e?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.7 },
    { name: 'Kadhai Paneer', category: 'Main Course', price: 290, img: 'https://images.unsplash.com/photo-1596797038558-9650d24494a7?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Malai Kofta', category: 'Main Course', price: 270, img: 'https://images.unsplash.com/photo-1644131233061-ec8813fa268d?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 },
    { name: 'Lachha Paratha', category: 'Main Course', price: 50, img: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Jeera Rice', category: 'Main Course', price: 150, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Egg Fried Rice', category: 'Chinese', price: 180, img: 'https://images.unsplash.com/photo-1512058460630-924bc3eadaec?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.4 },
    { name: 'Veg Manchurian', category: 'Chinese', price: 200, img: 'https://images.unsplash.com/photo-1544498928-1f661fa23932?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Chicken Lollipops', category: 'Starters', price: 320, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=400', isVeg: false, rating: 4.8 },
    { name: 'Brownie with Ice Cream', category: 'Desserts', price: 180, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.9 },
    { name: 'Blueberry Cheesecake', category: 'Desserts', price: 250, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215282ad?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.8 },
    { name: 'Lemonade', category: 'Beverages', price: 80, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.2 },
    { name: 'Orange Juice', category: 'Beverages', price: 120, img: 'https://images.unsplash.com/photo-1600271886362-5b79cd3f510b?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Caesar Salad', category: 'Starters', price: 220, img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.6 },
    { name: 'Onion Rings', category: 'Starters', price: 150, img: 'https://images.unsplash.com/photo-1639122612239-7a335a780bb6?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.5 },
    { name: 'Mushroom Salt & Pepper', category: 'Starters', price: 240, img: 'https://images.unsplash.com/photo-1621510456681-2da49fd57134?auto=format&fit=crop&q=80&w=400', isVeg: true, rating: 4.7 }
];

const seedDB = async () => {
    await Menu.deleteMany({});
    await Menu.insertMany(menuItems);
    console.log('Database Seeded with 50+ items');
    process.exit();
};

seedDB();
