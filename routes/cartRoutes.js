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

// Adding Item to Cart (Authenticated)
router.post('/', authenticateToken, async (req, res) => {
    const { menu_id, quantity, price } = req.body;

    try {
        // Checking if the item already exists in the cart for this user
        const cartItemResult = await pool.query(
            `SELECT * FROM cart WHERE menu_id = $1 AND user_id = $2`,
            [menu_id, req.user.user_id] 
        );

        if (cartItemResult.rows.length > 0) {
            const existingItem = cartItemResult.rows[0];
            const newQuantity = existingItem.quantity + quantity;

            // Updating the quantity if the item already exists in the cart
            const updateResult = await pool.query(
                `UPDATE cart SET quantity = $1 WHERE id = $2 RETURNING *`,
                [newQuantity, existingItem.id]
            );
            return res.status(200).json(updateResult.rows[0]);
        } else {
            // Inserting the item into the cart if it's not already present
            const insertResult = await pool.query(
                `INSERT INTO cart (menu_id, user_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *`,
                [menu_id, req.user.user_id, quantity, price] 
            );
            return res.status(201).json(insertResult.rows[0]);
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Getting Cart Items (Authenticated)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fetching the cart items for the authenticated user
        const result = await pool.query(
            `SELECT * FROM cart WHERE user_id = $1`,
            [req.user.user_id] 
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cart is empty' });
        }

     
    return res.json(result.rows); 
    }   catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  });

// Deleting Cart Item (Authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Deleting the item from the cart by its ID
        const deleteResult = await pool.query(
            `DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, req.user.user_id] 
        );

        if (deleteResult.rows.length > 0) {
            return res.status(200).json({ message: 'Item removed from cart' });
        } else {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Updating Cart Item Quantity (Authenticated)
router.put('/update', authenticateToken, async (req, res) => {
    const { menu_id, quantity } = req.body; 

    try {
        // Checking if the item exists in the cart for this user
        const cartItemResult = await pool.query(
            `SELECT * FROM cart WHERE menu_id = $1 AND user_id = $2`,
            [menu_id, req.user.user_id] 
        );

        if (cartItemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Updating the quantity for the item
        const updateResult = await pool.query(
            `UPDATE cart SET quantity = $1 WHERE menu_id = $2 AND user_id = $3 RETURNING *`,
            [quantity, menu_id, req.user.user_id] 
        );

        return res.status(200).json({ message: 'Cart item quantity updated', item: updateResult.rows[0] });
    } catch (error) {
        console.error('Error updating item quantity in cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
