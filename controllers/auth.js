const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");
const crypto = require('crypto');
const { sendPasswordResetEmail } = require("../utils/emailService");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }

    // CHECK IF USER IS APPROVED
    if (!user.isApproved) {
      req.flash("errors", { msg: "Your account is pending admin approval. Please wait for approval." });
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    console.log('User has logged out.')
  })
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};

exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (!req.body.companyName || req.body.companyName.trim() === '')
    validationErrors.push({ msg: "Company name is required" });
  if (!req.body.companyDescription || req.body.companyDescription.trim() === '')
    validationErrors.push({ msg: "Company description is required" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const user = new User({
    userName: req.body.userName,
    companyName: req.body.companyName,
    companyDescription: req.body.companyDescription,
    email: req.body.email,
    password: req.body.password,
    isApproved: false
  });

  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }

        // SEND ADMIN NOTIFICATION
        const { sendAdminNotification } = require("../utils/emailService");
        sendAdminNotification(user.userName, user.email, user.companyName, user.companyDescription);

        // DON'T AUTO-LOGIN - Show pending message instead
        req.flash("success", {
          msg: "Registration received! Your account is now under review. You will be able to login once approved. Questions? Contact connect.community@yahoo.com"
        });
        res.redirect("/login");
      });
    }
  );
};

exports.getForgotPassword = (req, res) => {
  res.render("forgot-password.ejs");
},

exports.postForgotPassword = async (req, res) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/forgot-password");
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      req.flash("errors", { msg: "No account with that email address exists." });
      return res.redirect("/forgot-password");
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Send email
    await sendPasswordResetEmail(user.email, user.userName, token);
    
    req.flash("success", { 
      msg: "An email has been sent to " + user.email + " with further instructions." 
    });
    res.redirect("/forgot-password");
  } catch (err) {
    console.log(err);
    req.flash("errors", { msg: "Error processing request. Please try again." });
    return res.redirect("/forgot-password");
  }
},

exports.getResetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("errors", { msg: "Password reset token is invalid or has expired." });
      return res.redirect("/forgot-password");
    }

    res.render("reset-password.ejs", { token: req.params.token });
  } catch (err) {
    console.log(err);
    res.redirect("/forgot-password");
  }
},

exports.postResetPassword = async (req, res) => {
  const validationErrors = [];
  
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({ msg: "Password must be at least 8 characters long" });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect(`/reset-password/${req.params.token}`);
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("errors", { msg: "Password reset token is invalid or has expired." });
      return res.redirect("/forgot-password");
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    req.flash("success", { msg: "Success! Your password has been changed. You can now login." });
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    req.flash("errors", { msg: "Error resetting password. Please try again." });
    res.redirect("/forgot-password");
  }
};
