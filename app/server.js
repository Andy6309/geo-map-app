const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Endpoint to handle user login
app.post('/api/login', async (req, res) => {
    const { username } = req.body;

    // Check if username is provided
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        // Check if the user exists
        let user = await prisma.users.findUnique({
            where: { username },
        });

        if (!user) {
            // If user doesn't exist, create the user
            user = await prisma.users.create({
                data: {
                    username,
                },
            });

            return res.status(200).json({ message: 'User created and logged in', user });
        }

        // Successful login
        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Failed to log in' });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
