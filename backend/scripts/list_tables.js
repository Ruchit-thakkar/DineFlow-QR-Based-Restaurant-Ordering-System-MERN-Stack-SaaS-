const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Table = mongoose.model('Table', new mongoose.Schema({}, { strict: false }));
    const tables = await Table.find({});
    console.log(JSON.stringify(tables, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
