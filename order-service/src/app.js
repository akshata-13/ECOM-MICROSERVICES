const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'order-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'orderdb',
  port: 5432
});

// Use container names for internal communication
const USER_SERVICE = 'http://user-service:8083';
const PRODUCT_SERVICE = 'http://product-service:8081';
const INVENTORY_SERVICE = 'http://inventory-service:8082';

// Create table
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT,
        product_id INT,
        quantity INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table ready');
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    client.release();
  }
})();

// GET all orders
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// CREATE new order
app.post('/orders', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    console.log('Creating order - User ID:', user_id, 'Product ID:', product_id, 'Quantity:', quantity);
    
    // Validate user exists
    const userResponse = await axios.get(`${USER_SERVICE}/users/${user_id}`);
    console.log('✅ User found:', userResponse.data.name);
    
    // Validate product exists
    const productResponse = await axios.get(`${PRODUCT_SERVICE}/products/${product_id}`);
    console.log('✅ Product found:', productResponse.data.name);
    
    // Check inventory
    const inventoryResponse = await axios.get(`${INVENTORY_SERVICE}/inventory/${product_id}`);
    console.log('✅ Inventory found - Stock:', inventoryResponse.data.quantity);
    
    if (inventoryResponse.data.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Create order
    const order = await pool.query(
      'INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [parseInt(user_id), parseInt(product_id), parseInt(quantity)]
    );

    // Update inventory (deduct quantity)
    await axios.put(`${INVENTORY_SERVICE}/inventory/${product_id}`, {
      quantity: inventoryResponse.data.quantity - quantity
    });

    console.log('✅ Order created successfully');
    res.json(order.rows[0]);
  } catch (err) {
    console.error('❌ Order creation failed:', err.message);
    
    if (err.response?.status === 404) {
      return res.status(400).json({ error: 'User or product not found' });
    }
    res.status(500).json({ error: 'Order creation failed' });
  }
});

const PORT = process.env.PORT || 8084;
app.listen(PORT, () => console.log(`🧾 Order service running on port ${PORT}`));