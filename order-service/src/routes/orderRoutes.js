const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    const db = req.app.locals.db;
    const { productService, inventoryService, userService } = req.app.locals.services;

    try {
        // 1. Verify user exists
        const user = await axios.get(`${userService}/users/${user_id}`);
        if (!user.data) return res.status(404).json({ error: "User not found" });

        // 2. Check inventory
        const inventory = await axios.get(`${inventoryService}/inventory/${product_id}`);
        if (!inventory.data || inventory.data.quantity < quantity) 
            return res.status(400).json({ error: "Insufficient inventory" });

        // 3. Reduce inventory
        await axios.patch(`${inventoryService}/inventory/${product_id}`, { quantity: inventory.data.quantity - quantity });

        // 4. Create order
        const result = await db.query(
            'INSERT INTO orders(user_id, product_id, quantity) VALUES($1,$2,$3) RETURNING *',
            [user_id, product_id, quantity]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Order creation failed" });
    }
});

module.exports = router;
