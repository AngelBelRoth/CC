const User = require("../models/User");
const { sendApprovalEmail, sendRejectionEmail } = require("../utils/emailService");

module.exports = {
  // View pending users
  getPendingUsers: async (req, res) => {
    try {
      const pendingUsers = await User.find({ isApproved: false }).sort({ requestedAt: -1 });
      res.render("admin/pending-users.ejs", { users: pendingUsers, user: req.user });
    } catch (err) {
      console.log(err);
      res.redirect("/profile");
    }
  },

  // Approve user
  approveUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
      
      // Send approval email
      await sendApprovalEmail(user.email, user.userName);
      
      console.log("User approved and email sent");
      req.flash("success", { msg: `User ${user.userName} has been approved and notified via email.` });
      res.redirect("/admin/pending-users");
    } catch (err) {
      console.log(err);
      req.flash("errors", { msg: "Error approving user." });
      res.redirect("/admin/pending-users");
    }
  },

  // Reject/Delete user
  rejectUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
      // Send rejection email before deleting
      await sendRejectionEmail(user.email, user.userName);
      
      await User.findByIdAndDelete(req.params.id);
      console.log("User rejected, notified, and deleted");
      req.flash("success", { msg: `User ${user.userName} has been rejected and notified via email.` });
      res.redirect("/admin/pending-users");
    } catch (err) {
      console.log(err);
      req.flash("errors", { msg: "Error rejecting user." });
      res.redirect("/admin/pending-users");
    }
  },

  // View all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().sort({ requestedAt: -1 });
      console.log(req.user)
      res.render("admin/all-users.ejs", { users: users, user: req.user });
    } catch (err) {
      console.log(err);
      res.redirect("/profile");
    }
  },

  // Toggle admin status
  toggleAdmin: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      user.isAdmin = !user.isAdmin;
      await user.save();
      console.log("Admin status toggled");
      res.redirect("/admin/all-users");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/all-users");
    }
  }
};