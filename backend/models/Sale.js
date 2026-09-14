const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        name: String,
        unit: String,
        quantity: Number,
        price: Number,
        subtotal: Number
      }
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card'], default: 'Cash' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);