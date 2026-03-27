const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    
    // Create default user if none exists
    let user = await User.findOne({});
    if (!user) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = await User.create({ email: 'abc@gmail.com', password: hashedPassword });
    }
    
    if (user.email !== email) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    
    await user.save();
    res.json({ message: 'Credentials updated successfully', email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
