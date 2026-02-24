const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [full_name, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};