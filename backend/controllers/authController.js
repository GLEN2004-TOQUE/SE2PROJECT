const pool = require('../config/db');
const { supabaseAdmin } = require('../supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { escapeForILike, emailExistsInUsers } = require('../utils/userLookup');

exports.register = async (req, res) => {
  try {
    const { fullName, email: rawEmail, password } = req.body;

    const email = (rawEmail || '').toLowerCase().trim();

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Basic email format validation (kept in sync with otpRoutes)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (await emailExistsInUsers(email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (full_name, email, password, password_plain, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [fullName, email, hashedPassword, String(password), 'student'] // self-registration is always student
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const emailNorm = String(email).toLowerCase().trim();

    const { data: sbUser, error: sbErr } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('email', escapeForILike(emailNorm))
      .maybeSingle();

    let user = null;
    if (!sbErr && sbUser) {
      if (!sbUser.password) {
        return res.status(401).json({
          message:
            'This account has no password set yet. Complete password reset from the login page, or contact support.',
        });
      }
      const validPassword = await bcrypt.compare(password, sbUser.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      user = sbUser;
    } else {
      const result = await pool.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [emailNorm]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const row = result.rows[0];
      if (!row.password) {
        return res.status(401).json({
          message:
            'This account has no password set yet. Complete password reset from the login page, or contact support.',
        });
      }
      const validPassword = await bcrypt.compare(password, row.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      user = row;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, full_name: user.full_name, role: user.role }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
};