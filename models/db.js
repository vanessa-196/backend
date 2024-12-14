require('dotenv').config(); // Loading environment variables from .env file
const { Pool } = require('pg');

// Creating a new Pool instance with database configuration from environment variables
const pool = new Pool({

    user: process.env.DB_USER,          // Database username
    host: process.env.DB_HOST,          // Database host
    database: process.env.DB_DATABASE,  // Database name
    password: process.env.DB_PASSWORD,  // Database password
    port: process.env.DB_PORT,          // Database port
    ssl:  true
});


// Testing the database connection
pool.connect()
    .then(() => console.log('Connected to the database successfully'))
    .catch(err => console.error('Database connection error:', err.message));

// Exporting the pool for use in other parts of the application
module.exports = { pool };
