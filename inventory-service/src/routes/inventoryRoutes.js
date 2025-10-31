const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const pool = req.app.locals.db;
    const result = await pool.query('SELECT * FROM inventory');
    res.json(result.rows);
});

router.post('/', async (req, res) => {
    const { product_id, quantity } = req.body;
    const pool = req.app.locals.db;
    const result = await pool.query('INSERT INTO inventory(product_id, quantity) VALUES($1,$2) RETURNING *', [product_id, quantity]);
    res.json(result.rows[0]);
});

module.exports = router;
