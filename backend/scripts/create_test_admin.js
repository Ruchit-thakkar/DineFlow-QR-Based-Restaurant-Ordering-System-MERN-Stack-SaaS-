const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, default: 'admin' }
    }, { strict: false }));
    
    const email = 'testadmin@gmail.com';
    const password = await bcrypt.hash('admin123', 10);
    
    await User.findOneAndUpdate(
      { email },
      { password, role: 'admin' },
      { upsert: true, new: true }
    );
    
    console.log('Test admin created/updated: testadmin@gmail.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
