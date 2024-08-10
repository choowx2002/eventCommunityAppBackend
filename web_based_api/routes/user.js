const express = require('express');
const { getUsers, createUser, getUserById } = require('../models/userModel');
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});


router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'User must have an email and a password' });
    }

    if (!/.+@.+\..+/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        await createUser({ name, email, password });
        res.status(201).json({ message: 'User created successfully' });
    } catch (e) {
        if (e.code === 11000) { // Duplicate key error
            return res.status(409).json({ error: 'Error creating user: Email already exists' });
        }
        res.status(500).json({ error: 'Error creating user', details: e.message });
    }
});

router.get('/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(201).json(user);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error fetching user', error: e.message });
    }
});

module.exports = router;
