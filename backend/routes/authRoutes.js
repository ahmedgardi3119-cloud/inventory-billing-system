const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');
const Sale = require('../models/Sale');
const { protect } = require('../middleware/authMiddleware');

// Token Generator Helper Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  const { name, identifier, password } = req.body;
  try {
    let userExists = await User.findOne({ identifier });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, identifier, password: hashedPassword });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      identifier: user.identifier,
      token: generateToken(user.id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. SEND OTP (Simulated/Official)
router.post('/send-otp', async (req, res) => {
  const { identifier } = req.body;
  try {
    let user = await User.findOne({ identifier });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-Digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = generatedOTP;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes
    await user.save();

    console.log(`🔑 DEMO OTP for ${identifier}: ${generatedOTP}`);

    res.json({ message: 'OTP sent successfully', demoOtp: generatedOTP });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. LOGIN WITH PASSWORD OR OTP
router.post('/login', async (req, res) => {
  const { identifier, password, otp } = req.body;
  try {
    const user = await User.findOne({ identifier });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Login via OTP
    if (otp) {
      if (user.otp === otp && user.otpExpires > Date.now()) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.json({
          _id: user.id,
          name: user.name,
          identifier: user.identifier,
          token: generateToken(user.id)
        });
      } else {
        return res.status(400).json({ message: 'Invalid or Expired OTP' });
      }
    }

    // Login via Password
    if (password && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user.id,
        name: user.name,
        identifier: user.identifier,
        token: generateToken(user.id)
      });
    }

    res.status(400).json({ message: 'Invalid Credentials' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE USERNAME & PASSWORD (Settings)
router.put('/update-profile', protect, async (req, res) => {
  const { name, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. DANGER ZONE: CLEAR ALL DATA
router.delete('/clear-all-data', protect, async (req, res) => {
  try {
    await Item.deleteMany({});
    await Sale.deleteMany({});
    res.json({ message: 'All inventory and sales records cleared successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;