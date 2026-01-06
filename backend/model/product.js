const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  imageData: {
    type: String,
    default: ''
  },
  // NEW FIELD: Link product to a seller
  sellerId: {
    type: mongoose.Schema.Types.ObjectId, // This will store the MongoDB _id of the seller
    ref: 'User', // This references the 'User' model (assuming your User model is named 'User')
    required: true // A product must belong to a seller
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);