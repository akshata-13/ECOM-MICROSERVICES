const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'inventory-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'inventorydb',
  port: 5432
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        product_id INT PRIMARY KEY,
        quantity INT NOT NULL
      )
    `);
    const res = await client.query('SELECT COUNT(*) FROM inventory');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO inventory (product_id, quantity)
        VALUES (1, 10), (2, 20)
      `);
      console.log('✅ Sample inventory inserted');
    }
  } finally {
    client.release();
  }
})();

app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.get('/inventory/:product_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE product_id=$1', [req.params.product_id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.put('/inventory/:product_id', async (req, res) => {
  try {
    const { quantity } = req.body;
    await pool.query('UPDATE inventory SET quantity=$1 WHERE product_id=$2', [quantity, req.params.product_id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`🏬 Inventory service running on port ${PORT}`));
