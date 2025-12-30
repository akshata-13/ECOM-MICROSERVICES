const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'user-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'userdb',
  port: 5432
});

// Create table and sample data
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
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    client.release();
  }
})();

// GET all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// CREATE new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log('Creating user:', name, email);
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => console.log(`👤 User service running on port ${PORT}`));