const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { 
      type: String, 
      required: true, 
      enum: ['kilogram', 'gram', 'litre', 'ml', 'packet', 'piece', 'dozen', 'box'] // Dropdown options
    },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 },
    minStockAlert: { type: Number, default: 5 } // Alert if stock drops below this level
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);