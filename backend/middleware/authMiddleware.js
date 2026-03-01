const getSupabase = require("../utils/supabaseClient");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const supabase = getSupabase(token);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return res.status(401).json({ message: "Invalid token" });

    req.user = user; // user.id, user.user_metadata.role, etc.
    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.authorizeRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role;
    if (userRole !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};