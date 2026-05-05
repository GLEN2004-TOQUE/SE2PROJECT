const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');
const { sendOTP, verifyOTP, debugStore } = require('../services/emailService');

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    emailConfigured: !!process.env.EMAIL_USER,
    emailUser: process.env.EMAIL_USER || 'NOT SET'
  });
});

router.post('/send', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1', [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'This email is already registered. Please log in instead.' });
    }

    await sendOTP(email);
    debugStore();

    res.json({ message: `OTP sent to ${email}. Please check your inbox and spam folder.` });
  } catch (err) {
    console.error('❌ Send OTP error:', err.message);
    if (err.message.includes('Invalid login') || err.message.includes('535')) {
      return res.status(500).json({ message: 'Email config error. Check EMAIL_USER and EMAIL_PASS in .env' });
    }
    if (/timeout|timed out|ETIMEDOUT|ECONNRESET|ENETUNREACH|EHOSTUNREACH/i.test(err.message || '')) {
      return res.status(503).json({
        message: 'Email service is busy right now. Please try again in a few seconds.',
      });
    }
    res.status(500).json({ message: 'Failed to send OTP: ' + err.message });
  }
});

router.post('/verify-and-register', async (req, res) => {
  try {
    const { fullName, email: rawEmail, password, role, course, section, otp } = req.body;
    const email = (rawEmail || '').toLowerCase().trim();

    if (!fullName || !email || !password || !course || !section || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const result = verifyOTP(email, otp);
    if (!result.valid) return res.status(400).json({ message: result.message });

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1', [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role, course, section, status)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, full_name, email, role, course, section`,
      [fullName.trim(), email, hashedPassword, role || 'student', course, section]
    );

    console.log(`✅ Registered: ${email} | Course: ${course} | Section: ${section}`);

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
});

module.exports = router;