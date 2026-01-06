// backend/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // <--- IMPORTANT: Ensure email is unique
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  // If you have a 'username' field, modify or remove it:
  // Option A: Remove 'username' if you don't need it at all:
  // (delete the 'username' line if it exists)

  // Option B: Keep 'username' but remove its unique constraint
  // username: { type: String /*, unique: true <--- REMOVE THIS! */ },
  // If you keep it but don't provide it during registration, you might want it as:
  // username: { type: String, default: null } // or just { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);