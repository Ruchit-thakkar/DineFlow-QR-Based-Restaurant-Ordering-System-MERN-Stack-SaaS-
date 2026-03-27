const Table = require('../models/Table');

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ createdAt: -1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const { name } = req.body;
    // Generate a unique identifier like table-12345
    const identifier = `table-${Date.now()}`;
    const table = await Table.create({ name, identifier });
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
