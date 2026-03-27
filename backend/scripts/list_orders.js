const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(JSON.stringify(orders, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
