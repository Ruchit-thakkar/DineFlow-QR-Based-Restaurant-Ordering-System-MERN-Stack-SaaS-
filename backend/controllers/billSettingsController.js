const BillSetting = require('../models/BillSetting');

exports.getSettings = async (req, res) => {
  try {
    let settings = await BillSetting.findOne();
    if (!settings) {
      settings = await BillSetting.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await BillSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
