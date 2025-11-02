const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const sendSMS = require('../utils/smsService');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser && existingUser.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    let user = existingUser;
    if (!user) {
      user = new User({ phoneNumber });
    }

    const otp = user.generateOTP();
    await user.save();

    // Send OTP via SMS
    await sendSMS(phoneNumber, `Your CodeCollab verification code is: ${otp}`);

    res.status(200).json({ 
      message: 'OTP sent successfully',
      phoneNumber: phoneNumber
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, fullName, email, username, password } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if username or email already exists
    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Update user details
    user.fullName = fullName;
    user.email = email;
    user.username = username;
    user.password = password;
    user.isPhoneVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // Send confirmation email with credentials
    await sendEmail(
      email,
      'Welcome to CodeCollab!',
      `
        <h2>Welcome to CodeCollab!</h2>
        <p>Hi ${fullName},</p>
        <p>Your account has been successfully created. Here are your login details:</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> [The password you set during registration]</p>
        <p>You can now log in and start collaborating on code!</p>
        <br>
        <p>Best regards,<br>CodeCollab Team</p>
      `
    );

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update user status
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        await User.findByIdAndUpdate(decoded.userId, {
          status: 'offline',
          lastSeen: new Date()
        });
      } catch (error) {
        // Token is invalid, but we still return success
      }
    }

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password -otp');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;