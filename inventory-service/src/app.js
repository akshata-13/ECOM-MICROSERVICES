const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'inventory-db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'inventorydb',
  port: 5432
});

// Create table and sample data
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
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    client.release();
  }
})();

// GET all inventory with product details
app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY product_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET inventory by product ID
app.get('/inventory/:product_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE product_id=$1', [req.params.product_id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// UPDATE inventory quantity
app.put('/inventory/:product_id', async (req, res) => {
  try {
    const { quantity } = req.body;
    await pool.query('UPDATE inventory SET quantity=$1 WHERE product_id=$2', [quantity, req.params.product_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// CREATE or UPDATE inventory item
app.post('/inventory', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    console.log('Adding inventory for product:', product_id, 'quantity:', quantity);
    
    if (!product_id || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Check if product exists in inventory
    const existing = await pool.query('SELECT * FROM inventory WHERE product_id=$1', [parseInt(product_id)]);
    
    if (existing.rows.length > 0) {
      // UPDATE existing inventory
      const result = await pool.query(
        'UPDATE inventory SET quantity = quantity + $1 WHERE product_id=$2 RETURNING *',
        [parseInt(quantity), parseInt(product_id)]
      );
      console.log('✅ Updated existing inventory');
      res.json(result.rows[0]);
    } else {
      // INSERT new inventory item
      const result = await pool.query(
        'INSERT INTO inventory (product_id, quantity) VALUES ($1, $2) RETURNING *',
        [parseInt(product_id), parseInt(quantity)]
      );
      console.log('✅ Created new inventory item');
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`🏬 Inventory service running on port ${PORT}`));