const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

// All admin routes require a valid token + admin role
const adminOnly = [verifyToken, authorizeRole("admin")];

router.get("/stats",           ...adminOnly, adminController.getStats);
router.get("/users",           ...adminOnly, adminController.getUsers);
router.get("/users/:id",       ...adminOnly, adminController.getUserById);
router.patch("/users/:id/status", ...adminOnly, adminController.setUserStatus);
router.get("/leaderboard",     ...adminOnly, adminController.getLeaderboard);

module.exports = router;