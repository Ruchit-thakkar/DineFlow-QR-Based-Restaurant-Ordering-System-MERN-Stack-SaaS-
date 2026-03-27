const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({});
    if (user) {
      console.log('CURRENT ADMIN EMAIL:', user.email);
    } else {
      console.log('NO USER FOUND IN DATABASE');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
