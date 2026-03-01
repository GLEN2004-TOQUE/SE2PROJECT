const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const getSupabase = require('../utils/supabaseClient');

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    const supabase = getSupabase(null);

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role, // stored in user_metadata
        }
      }
    });

    if (error) return res.status(400).json({ message: error.message });

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const supabase = getSupabase(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ message: error.message });

    res.json({ token: data.session.access_token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token);

    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};