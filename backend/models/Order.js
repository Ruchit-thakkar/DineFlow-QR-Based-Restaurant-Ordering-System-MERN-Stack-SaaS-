const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  title: String,
  price: Number,
  quantity: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'MAKING', 'READY', 'CONFIRMED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
