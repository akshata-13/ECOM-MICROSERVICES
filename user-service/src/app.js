const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // ✅ allow frontend
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'user-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'userdb',
  port: 5432
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE
      )
    `);
    const res = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (name, email)
        VALUES ('Alice', 'alice@example.com'),
               ('Bob', 'bob@example.com')
      `);
      console.log('✅ Sample users inserted');
    }
  } finally {
    client.release();
  }
})();

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => console.log(`👤 User service running on port ${PORT}`));
