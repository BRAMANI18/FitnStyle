// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.js'); // Ensure this path is correct relative to auth.js

// Register (no changes needed here, assuming it works)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login - FIXED (ensure _id is converted to string for localStorage)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      // IMPORTANT: In a real app, hash and compare passwords using bcrypt.compare()
      // This simple comparison is insecure.
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // In a real application, you would generate a JWT token here

    // --- FIX IS HERE: Include _id and convert it to string ---
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id.toString(), // <--- Add this line and .toString()
        name: user.name,
        email: user.email,
        role: user.role // Ensure the role is sent back
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

module.exports = router;