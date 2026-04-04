const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { sendOTP, verifyOTP } = require('../services/emailService');

// POST /otp/send — check email not taken, then send OTP
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    await sendOTP(email);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Check email config.' });
  }
});

// POST /otp/verify-and-register — verify OTP then create account
router.post('/verify-and-register', async (req, res) => {
  try {
    const { fullName, email, password, role, course, otp } = req.body;

    if (!fullName || !email || !password || !course || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify OTP
    const result = verifyOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ message: result.message });
    }

    // Check email again (race condition guard)
    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role, course, status)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, full_name, email, role, course`,
      [fullName, email, hashedPassword, role || 'student', course]
    );

    res.status(201).json({
      message: 'Registration successful!',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;