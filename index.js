//index.js
//importing necessary routes and libraries
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const orderRoutes = require('./routes/orderRoutes'); 

// Loading environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

// Middleware setup
app.use(cors()); // Enabling CORS
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);

app.use('/api/menu', menuRoutes);

app.use('/api/cart', cartRoutes);  

app.use('/api/orders', orderRoutes);  

// Route for testing
app.get('/', (req, res) => {
    res.send('Hello, Welcome to the Canteen Ordering System!');
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
