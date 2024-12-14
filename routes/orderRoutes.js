const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../models/db');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Creating Order (Authenticated)
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Geting cart items for the authenticated user
        const cartItems = await pool.query(
            `SELECT * FROM cart WHERE user_id = $1`,
            [req.user.user_id] 
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ error: 'Cart is empty, cannot create an order' });
        }

        // Calculating the total price for the order from the cart items
        const totalPrice = cartItems.rows.reduce((total, item) => total + (item.quantity * item.price), 0);

        // Creating a new order
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *`,
            [req.user.user_id, totalPrice]
        );

        // Moving cart items to order_items table
        for (const item of cartItems.rows) {
            await pool.query(
                `INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES ($1, $2, $3, $4)`,
                [orderResult.rows[0].id, item.menu_id, item.quantity, item.price]
            );
        }

        // Clearing the cart after the order is created
        await pool.query(`DELETE FROM cart WHERE user_id = $1`, [req.user.user_id]);

        // Sending a response back with order details
        res.status(201).json({ message: 'Order created successfully', order: orderResult.rows[0] });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Geting  Orders (Authenticated)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fetching orders for the authenticated user
        const result = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1`,
            [req.user.user_id] 
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
