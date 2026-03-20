const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    // Frontend sends 'fullName' (camelCase) – map to 'full_name' for DB
    const { fullName, email, password, role } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user – note the column name is 'full_name'
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [fullName, email, hashedPassword, role || 'student'] // default role if not provided
    );

    // 5. Send success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    // Log the actual error for debugging (server side)
    console.error('Registration error:', err);
    // Send a consistent error format the frontend expects (message field)
    res.status(500).json({ message: err.message });
  }
};