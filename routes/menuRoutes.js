//menuRoutes.js
const express = require('express');
const { pool } = require('../models/db');
const router = express.Router();

// Geting Menu Items from the table in database
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch menu" });
    }
});



module.exports = router;
