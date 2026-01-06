const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// NEW: GET /api/cart - Informational message for the base path
// This route will catch requests to http://localhost:5000/api/cart
// and guide the user to provide a customer ID.
router.get('/', (req, res) => {
    res.status(400).json({ message: 'Please provide a customer ID to retrieve a cart, e.g., /api/cart/yourCustomerId' });
});

// GET /api/cart/:customerId - Get cart by customer ID (your existing code)
router.get('/:customerId', async (req, res) => {
    try {
        // Populate the product details within the cart items
        const cart = await Cart.findOne({ customerId: req.params.customerId }).populate('items.productId');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    } catch (err) {
        console.error("Error fetching cart:", err); // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cart - Add/update item in cart (UPDATED)
router.post('/', async (req, res) => {
    // Destructure 'size' from the request body
    const { customerId, productId, quantity, size } = req.body; 
    
    if (!customerId || !productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid input: customerId, productId, and a positive quantity are required.' });
    }
    // Optional: Add validation for size if it's mandatory for all products
    // if (!size) {
    //     return res.status(400).json({ error: 'Size is required for this product.' });
    // }

    try {
        let cart = await Cart.findOne({ customerId });

        if (!cart) {
            // Create a new cart if one doesn't exist for the customer
            // Include 'size' when creating a new item
            cart = new Cart({ customerId, items: [{ productId, quantity, size }] }); 
        } else {
            // Find if the product with the SAME SIZE already exists in the cart
            // This is crucial: items with different sizes are considered different cart items
            const itemIndex = cart.items.findIndex(item => 
                item.productId.equals(productId) && item.size === size
            );

            if (itemIndex > -1) {
                // Update quantity if item (with same size) exists
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item (with its size) if it doesn't exist
                cart.items.push({ productId, quantity, size }); 
            }
        }
        await cart.save();
        // Re-populate after saving to ensure updated product details are sent in response
        await cart.populate('items.productId'); 
        res.status(200).json(cart); // Use 200 OK for successful update/creation
    } catch (err) {
        console.error("Error updating cart on POST:", err); // Log the error for debugging
        res.status(500).json({ error: 'Error updating cart' });
    }
});

// PATCH /api/cart/:customerId/item/:productId - Update quantity directly (your existing code)
// NOTE: This route currently only updates quantity. If you also want to allow
// updating size via PATCH, you would need to modify this route as well.
router.patch('/:customerId/item/:productId', async (req, res) => {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) { // Check for undefined to allow 0 for removal
        return res.status(400).json({ error: 'Invalid quantity: quantity must be a non-negative number.' });
    }
    try {
        let cart = await Cart.findOne({ customerId: req.params.customerId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // IMPORTANT: If you want to update quantity for a specific size,
        // you'll need to pass 'size' in the URL or body for this PATCH route
        // and adjust the findIndex logic. For now, it updates the first matching productId.
        const itemIndex = cart.items.findIndex(item => item.productId.equals(req.params.productId));
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart.' });

        if (quantity === 0) {
            // Remove item if quantity is set to 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }
        await cart.save();
        await cart.populate('items.productId'); 
        res.json(cart);
    } catch (err) {
        console.error("Error patching cart item:", err); // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cart/:customerId/item/:productId - Remove item (your existing code)
// IMPORTANT: Similar to PATCH, if you want to remove a specific size,
// you'll need to pass 'size' and adjust the findIndex logic.
router.delete('/:customerId/item/:productId', async (req, res) => {
    try {
        let cart = await Cart.findOne({ customerId: req.params.customerId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.productId.equals(req.params.productId));
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart.' });

        cart.items.splice(itemIndex, 1); // Remove the item
        await cart.save();
        await cart.populate('items.productId');
        res.status(200).json({ message: 'Item removed successfully', cart }); // Return the updated cart
    } catch (err) {
        console.error("Error deleting cart item:", err); // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
});

// NEW: DELETE /api/cart/:customerId/clear - Clear the entire cart
router.delete('/:customerId/clear', async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({ customerId: req.params.customerId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this customer.' });
        }
        res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (err) {
        console.error("Error clearing cart:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;