const Item = require('../models/Item');
const imagekit = require('../utils/imagekit');

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      try {
        const uploadResponse = await imagekit.upload({
          file: req.file.buffer, // Passing buffer directly
          fileName: req.file.originalname,
        });
        imageUrl = uploadResponse.url;
      } catch (uploadErr) {
        console.error('Image upload failed', uploadErr);
      }
    }
    
    const item = await Item.create({ title, description, price, category, imageUrl });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let updateData = { title, description, price, category };
    
    if (req.file) {
      try {
        const uploadResponse = await imagekit.upload({
           file: req.file.buffer,
           fileName: req.file.originalname,
        });
        updateData.imageUrl = uploadResponse.url;
      } catch (uploadErr) {
         console.error('Image upload failed', uploadErr);
      }
    }
    
    const item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Item.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
