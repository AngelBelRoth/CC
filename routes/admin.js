const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const { ensureAuth, ensureAdmin } = require("../middleware/auth");

// Admin routes - only accessible by admins
router.get("/pending-users", ensureAuth, ensureAdmin, adminController.getPendingUsers);
router.post("/approve-user/:id", ensureAuth, ensureAdmin, adminController.approveUser);
router.post("/reject-user/:id", ensureAuth, ensureAdmin, adminController.rejectUser);
router.get("/all-users", ensureAuth, ensureAdmin, adminController.getAllUsers);
router.post("/toggle-admin/:id", ensureAuth, ensureAdmin, adminController.toggleAdmin);

module.exports = router; 