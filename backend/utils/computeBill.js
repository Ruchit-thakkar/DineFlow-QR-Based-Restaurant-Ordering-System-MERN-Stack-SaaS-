const BillSetting = require('../models/BillSetting');

exports.computeBillData = async (order) => {
  let settings = await BillSetting.findOne();
  if (!settings) {
    settings = {
      restaurantName: 'Restaurant',
      address: '',
      gstNumber: '',
      gstPercentage: 0,
      showGst: false,
      serviceCharge: 0,
      currency: 'INR',
      showBreakdown: false
    };
  }

  const subtotal = order.totalAmount || 0;
  const serviceCharge = settings.serviceCharge || 0;
  let gstAmount = 0;
  let cgst = 0;
  let sgst = 0;

  if (settings.showGst && settings.gstPercentage > 0) {
    gstAmount = (subtotal + serviceCharge) * (settings.gstPercentage / 100);
    if (settings.showBreakdown) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }
  }

  const grandTotal = subtotal + serviceCharge + gstAmount;

  return {
    restaurantName: settings.restaurantName,
    address: settings.address,
    gstNumber: settings.gstNumber,
    showGst: settings.showGst,
    gstPercentage: settings.gstPercentage,
    showBreakdown: settings.showBreakdown,
    currency: settings.currency,
    subtotal: parseFloat(subtotal.toFixed(2)),
    serviceCharge: parseFloat(serviceCharge.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
};
