const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const pool = req.app.locals.db;
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
});

router.post('/', async (req, res) => {
    const { name, price } = req.body;
    const pool = req.app.locals.db;
    const result = await pool.query('INSERT INTO products(name, price) VALUES($1,$2) RETURNING *', [name, price]);
    res.json(result.rows[0]);
});

module.exports = router;
