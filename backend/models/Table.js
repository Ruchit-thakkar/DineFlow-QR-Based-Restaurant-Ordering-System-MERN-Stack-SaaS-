const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  identifier: { type: String, required: true, unique: true }, // Used for the QR code URL
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
