const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Assuming your User model is in ../models/user.js
const Product = require('../models/product'); // We'll still need this to view all products

// Middleware to check if the user is an admin (basic check, enhance with proper authentication/JWT in a real app)
const isAdmin = (req, res, next) => {
    // In a real application, you'd verify a JWT and check the role from the token payload.
    // For this demonstration, we are relying on client-side localStorage for simplicity,
    // but BE AWARE: this is INSECURE for production.
    // A proper check would look something like:
    // if (req.user && req.user.role === 'admin') {
    //     next();
    // } else {
    //     res.status(403).json({ message: 'Access denied. Admin rights required.' });
    // }
    next(); // For now, allow all requests to proceed. Implement proper auth here later.
};

// --- User Management (Customers & Sellers) ---

// @route   GET /api/admin/users
// @desc    Get all users (customers and sellers)
router.get('/users', isAdmin, async (req, res) => {
    try {
        // Fetch users excluding 'admin' role if you don't want to manage other admins via this panel
        const users = await User.find({ role: { $in: ['customer', 'seller'] } }).select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user (customer or seller) by ID
router.put('/users/:id', isAdmin, async (req, res) => {
    const { name, email, role } = req.body; // Allow admin to update name, email, role
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name !== undefined ? name : user.name;
        user.email = email !== undefined ? email : user.email;
        // Allow role change to 'customer', 'seller', or 'admin'
        if (role && ['customer', 'seller', 'admin'].includes(role)) {
             user.role = role;
        }

        await user.save();
        // Return updated user, excluding password
        const updatedUser = await User.findById(req.params.id).select('-password');
        res.json({ message: 'User updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (customer or seller) by ID
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// No specific product routes needed here, admin can use existing /api/products GET route to view all.

module.exports = router;