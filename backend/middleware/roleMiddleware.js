const jwt = require("jsonwebtoken");
const { supabaseAdmin } = require("../supabaseClient");

/**
 * Verify JWT and attach decoded user to req.user
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Authorize one or more roles.
 * Usage: authorizeRole("teacher")  or  authorizeRole("teacher", "admin")
 */
exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }
    next();
  };
};

/**
 * Allow only the resource owner OR a teacher/admin.
 * Compares req.user.id against a param name (default "userId").
 */
exports.authorizeOwnerOrRole = (paramName = "userId", ...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const isOwner = String(req.user.id) === String(req.params[paramName]);
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

/**
 * Verify the user record still exists and is active in the DB.
 * Attaches the full DB user to req.dbUser.
 */
exports.requireActiveUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, role, status")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status === false) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.dbUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Authentication check failed" });
  }
};