const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { supabaseAdmin } = require('../supabaseClient');
const {
  sendOTP,
  verifyOTP,
  debugStore,
  sendForgotPasswordOTP,
  verifyForgotPasswordOtpAndClearPassword,
} = require('../services/emailService');
const { emailExistsInUsers, escapeForILike } = require('../utils/userLookup');

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    emailConfigured: !!process.env.EMAIL_USER,
    emailUser: process.env.EMAIL_USER || 'NOT SET'
  });
});

router.post('/send', async (req, res) => {
  try {
    // Registration flow sends `email`. Some clients send `identifier` instead.
    const email = String(req.body.email || req.body.identifier || '')
      .toLowerCase()
      .trim();
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

    if (await emailExistsInUsers(email)) {
      return res.status(409).json({ message: 'This email is already registered. Please log in instead.' });
    }

    await sendOTP(email);
    if (process.env.DEBUG_OTP === '1') {
      try {
        await debugStore();
      } catch (debugErr) {
        console.warn('⚠️ OTP debugStore failed:', debugErr.message || debugErr);
      }
    }

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
    const {
      firstName,
      middleName,
      lastName,
      fullName,
      email: rawEmail,
      password,
      course,
      section,
      otp,
    } = req.body;
    const email = (rawEmail || '').toLowerCase().trim();
    const cleanFirstName = String(firstName || '').trim();
    const cleanMiddleName = String(middleName || '').trim();
    const cleanLastName = String(lastName || '').trim();
    const cleanFullName = String(fullName || '').trim();
    const resolvedFullName = [cleanFirstName, cleanMiddleName, cleanLastName].filter(Boolean).join(' ') || cleanFullName;

    if (!resolvedFullName || !email || !password || !course || !section || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    

    const result = await verifyOTP(email, otp);
    if (!result.valid) return res.status(400).json({ message: result.message });

    if (await emailExistsInUsers(email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = null;
    try {
      newUser = await pool.query(
        `INSERT INTO users (full_name, email, password, password_plain, role, course, section, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING id, full_name, email, role, course, section`,
        [resolvedFullName.trim(), email, hashedPassword, String(password), 'student', course, section]
      );
      newUser = newUser.rows[0];
      console.log(`✅ Registered in Postgres: ${email} | Course: ${course} | Section: ${section}`);
    } catch (dbErr) {
      console.warn('⚠️ Postgres registration failed, trying Supabase fallback:', dbErr.message || dbErr);
      if (dbErr.code === 'ECONNREFUSED' || String(dbErr.message).includes('connect ECONNREFUSED')) {
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert([
            {
              full_name: resolvedFullName.trim(),
              email,
              password: hashedPassword,
              role: 'student',
              course,
              section,
              status: true,
            },
          ])
          .select('id, full_name, email, role, course, section');

        if (error) {
          console.error('❌ Supabase fallback registration failed:', error.message || error);
          throw error;
        }
        newUser = data?.[0] || null;
        console.log(`✅ Registered in Supabase fallback: ${email} | Course: ${course} | Section: ${section}`);
      } else {
        throw dbErr;
      }
    }

    if (!newUser) {
      throw new Error('Registration failed: could not create user record.');
    }

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      user: newUser,
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    if (err.code === '42703') {
      return res.status(503).json({
        message: 'Registration failed due to database schema mismatch. Contact an administrator.',
      });
    }
    res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
});

// ─── Forgot password (existing Supabase or Postgres users) ───────────────────

router.post('/forgot-password/send', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY not set in environment');
      return res.status(500).json({ message: 'Email service not configured. Contact support.' });
    }

    if (!(await emailExistsInUsers(email))) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    await sendForgotPasswordOTP(email);
    if (process.env.DEBUG_OTP === '1') await debugStore();

    res.json({
      message: `A verification code was sent to ${email}. Check your inbox and spam folder.`,
    });
  } catch (err) {
    if (err.code === 'NO_ACCOUNT') {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }
    console.error('❌ Forgot-password send error:', err.message);
    if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ message: 'Email service temporarily unavailable. Try again shortly.' });
    }
    res.status(500).json({ message: err.message || 'Failed to send reset code. Please try again.' });
  }
});

router.post('/forgot-password/verify', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const otp = req.body.otp;
    if (!email || otp == null || String(otp).trim() === '') {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const result = await verifyForgotPasswordOtpAndClearPassword(email, otp);
    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }

    const resetToken = jwt.sign(
      { pwdReset: true, email: result.email, src: result.source },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      message: 'Code verified. Choose a new password below.',
      resetToken,
    });
  } catch (err) {
    console.error('❌ Forgot-password verify error:', err.message);
    res.status(500).json({ message: err.message || 'Verification failed.' });
  }
});

router.post('/forgot-password/complete', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        message: 'Reset session expired. Please start forgot password again.',
      });
    }

    if (!payload.pwdReset || !payload.email || !payload.src) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const emailNorm = String(payload.email).toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    if (payload.src === 'supabase') {
      const { data: row, error: selErr } = await supabaseAdmin
        .from('users')
        .select('id')
        .ilike('email', escapeForILike(emailNorm))
        .maybeSingle();
      if (selErr) throw selErr;
      if (!row) return res.status(400).json({ message: 'User not found.' });

      const { error: upErr } = await supabaseAdmin
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', row.id);
      if (upErr) throw upErr;
    } else {
      const r = await pool.query(
        `UPDATE users SET password = $1
         WHERE LOWER(TRIM(email)) = $2
         RETURNING id`,
        [hashedPassword, emailNorm]
      );
      if (r.rowCount === 0) {
        return res.status(400).json({ message: 'User not found.' });
      }
    }

    res.json({ message: 'Password updated. You can sign in with your email and new password.' });
  } catch (err) {
    console.error('❌ Forgot-password complete error:', err.message);
    res.status(500).json({ message: err.message || 'Could not update password.' });
  }
});

module.exports = router;
