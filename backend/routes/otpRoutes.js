const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');
const { sendOTP, verifyOTP, debugStore } = require('../services/emailService');
const { supabaseAdmin } = require('../supabaseClient');

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

    // Check Brevo key (not EMAIL_USER/PASS anymore)
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY not set in environment');
      return res.status(500).json({ message: 'Email service not configured. Contact support.' });
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
    console.error('❌ Send OTP error:', err.message, err.code || '');

    if (err.message.includes('Invalid login') || err.message.includes('535')) {
      return res.status(500).json({ message: 'Gmail authentication failed.' });
    }
    if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ message: 'Email service temporarily unavailable. Try again shortly.' });
    }

    res.status(500).json({ message: err.message || 'Failed to send OTP. Please try again.' });
  }
});
router.post('/verify-and-register', async (req, res) => {
  try {
    const { fullName, email: rawEmail, password, course, section, otp } = req.body;
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
      [fullName.trim(), email, hashedPassword, 'student', course, section] // force student role on self-registration
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

// ─── Forgot password (OTP) ─────────────────────────────────────────────
// Flow:
// 1) POST /otp/forgot/send    -> sends OTP to email
// 2) POST /otp/forgot/verify -> verify OTP + update password in Supabase

router.post('/forgot/send', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Only allow reset for existing users in your database
    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    await sendOTP(email);
    debugStore();

    res.json({ message: `OTP sent to ${email}. Please check your inbox and spam folder.` });
  } catch (err) {
    console.error('❌ Forgot password send OTP error:', err.message, err.code || '');
    res.status(500).json({ message: err.message || 'Failed to send OTP. Please try again.' });
  }
});

router.post('/forgot/verify', async (req, res) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;
    const email = (rawEmail || '').toLowerCase().trim();

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'email, otp, and newPassword are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const result = verifyOTP(email, otp);
    if (!result.valid) return res.status(400).json({ message: result.message });

    // 1) Update password in Postgres table (so backend /login works)
    const hashed = await bcrypt.hash(String(newPassword), 10);
    const { error: pgErr } = await pool.query(
      'UPDATE users SET password = $1 WHERE LOWER(email) = $2',
      [hashed, email]
    );
    if (pgErr) {
      return res.status(400).json({ message: pgErr.message || 'Failed to update password (DB)' });
    }

    // 2) Update password in Supabase auth user (kept in sync)
    const { supabaseAdmin } = require('../supabaseClient');

    const { data: supaUser, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      return res.status(500).json({ message: listErr.message || 'Failed to find Supabase user' });
    }

    const match = (supaUser?.users || []).find(u => String(u.email || '').toLowerCase() === email);
    if (!match) {
      return res.status(404).json({ message: 'Supabase user not found for this email' });
    }

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(match.id, {
      password: newPassword,
    });

    if (updateErr) {
      return res.status(400).json({ message: updateErr.message || 'Failed to update password (Supabase)' });
    }

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('❌ Forgot password verify error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to reset password' });
  }
});

module.exports = router;
