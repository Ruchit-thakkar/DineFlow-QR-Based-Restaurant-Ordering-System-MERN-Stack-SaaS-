const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/User');

async function reset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@gmail.com';
    const password = await bcrypt.hash('admin123', 10);
    
    // Update or create the admin user
    await User.findOneAndUpdate(
      { }, // Find the first user or create one
      { email, password },
      { upsert: true, new: true }
    );
    
    console.log('Admin account reset to: admin@gmail.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
