const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Make sure path and casing match your file

// @route   POST /api/products
// @desc    Add a new product
router.post('/', async (req, res) => {
  // Destructure sellerId from req.body as well
  const { name, price, category, description, imageData, sellerId } = req.body;

  // Basic validation (you might want more robust validation)
  if (!name || !price || !category || !sellerId) {
    return res.status(400).json({ message: 'Missing required product fields (name, price, category) or seller ID.' });
  }

  try {
    const newProduct = new Product({
      name,
      price,
      category,
      description: description || '', // Use default if description is not provided
      imageData: imageData || '',     // Use default if imageData is not provided
      sellerId, // Make sure sellerId is saved with the product
    });

    const product = await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// @route   GET /api/products
// @desc    Get all products or products by a specific seller
router.get('/', async (req, res) => {
  try {
    const { sellerId } = req.query; // Get sellerId from query parameter
    let query = {};
    if (sellerId) {
      query = { sellerId: sellerId }; // Filter products if sellerId is provided
    }
    const products = await Product.find(query); // Find products based on the query
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product by ID
router.put('/:id', async (req, res) => {
  // sellerId is not expected in the body for PUT, as it's part of the product identity.
  const { name, price, category, description, imageData } = req.body;
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields if provided (check for undefined to allow null/empty strings if intended)
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (imageData !== undefined) product.imageData = imageData;

    await product.save();
    res.json({ message: 'Product updated successfully!', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await Product.deleteOne({ _id: req.params.id }); // Use deleteOne on the model
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;