const mongoose = require('mongoose');

const billSettingSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'My Restaurant' },
  address: { type: String, default: '123 Main Street' },
  gstNumber: { type: String, default: '' },
  gstPercentage: { type: Number, default: 0 },
  showGst: { type: Boolean, default: false },
  serviceCharge: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  showBreakdown: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BillSetting', billSettingSchema);
