const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'order-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'orderdb',
  port: 5432
});

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://user-service:8083';
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8081';
const INVENTORY_SERVICE = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:8082';

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT,
        product_id INT,
        quantity INT
      )
    `);
    console.log('✅ Orders table ready');
  } finally {
    client.release();
  }
})();

app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/orders', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const user = await axios.get(`${USER_SERVICE}/users/${user_id}`);
    const product = await axios.get(`${PRODUCT_SERVICE}/products/${product_id}`);
    const inventory = await axios.get(`${INVENTORY_SERVICE}/inventory/${product_id}`);

    if (inventory.data.quantity < quantity)
      return res.status(400).json({ error: 'Insufficient stock' });

    const order = await pool.query(
      'INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [user_id, product_id, quantity]
    );

    await axios.put(`${INVENTORY_SERVICE}/inventory/${product_id}`, {
      quantity: inventory.data.quantity - quantity
    });

    res.json(order.rows[0]);
  } catch (err) {
    console.error('❌ Order creation failed:', err.message);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

const PORT = process.env.PORT || 8084;
app.listen(PORT, () => console.log(`🧾 Order service running on port ${PORT}`));
