const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    
    // Check if user exists by email
    let user = await User.findOne({ email });
    
    // Create default user if no users exist at all in the system
    if (!user) {
      const anyUser = await User.findOne({});
      if (!anyUser && email === 'admin@gmail.com') {
         const hashedPassword = await bcrypt.hash('admin123', 10);
         user = await User.create({ email: 'admin@gmail.com', password: hashedPassword, role: 'admin' });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    
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
