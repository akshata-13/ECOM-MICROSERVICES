const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'product-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'productdb',
  port: 5432
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        price NUMERIC(10,2)
      )
    `);
    const res = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, price)
        VALUES ('Laptop', 1500.00),
               ('Phone', 700.00)
      `);
      console.log('✅ Sample products inserted');
    }
  } finally {
    client.release();
  }
})();

app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`📦 Product service running on port ${PORT}`));
