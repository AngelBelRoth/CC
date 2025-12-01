const nodemailer = require('nodemailer');


// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send approval email
const sendApprovalEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Account Has Been Approved!',
    html: `
      <h2>Welcome, ${userName}!</h2>
      <p>Great news! Your account has been approved by our admin team.</p>
      <p>You can now login and start using our platform.</p>
      <p><a href="${process.env.BASE_URL || 'http://localhost:8000'}/login">Click here to login</a></p>
      <p>Thank you for joining us!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send rejection email
const sendRejectionEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Account Registration Update',
    html: `
      <h2>Hello, ${userName}</h2>
      <p>Unfortunately, your account registration was not approved at this time.</p>
      <p>If you believe this was a mistake, please contact our support team.</p>
      <p>Thank you for your interest.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send new registration notification to admin
// In utils/emailService.js, update sendAdminNotification:

const sendAdminNotification = async (userName, userEmail, companyName, companyDescription) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'New User Registration Pending Approval',
    html: `
      <h2>New User Registration</h2>
      <p>A new user has registered and is waiting for approval:</p>
      <ul>
        <li><strong>Username:</strong> ${userName}</li>
        <li><strong>Company Name:</strong> ${companyName}</li>
        <li><strong>Company Description:</strong> ${companyDescription}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>Registration Time:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p><strong>To review this user:</strong></p>
      <ol>
        <li>Login to your admin account at <a href="${process.env.BASE_URL || 'http://localhost:8000'}/login">${process.env.BASE_URL || 'http://localhost:8000'}/login</a></li>
        <li>Go to Admin Panel > Pending Users</li>
      </ol>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent for new user:', userName);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:8000'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Request',
    html: `
      <h2>Hello ${userName},</h2>
      <p>You requested to reset your password.</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p>Questions? Contact us at: <a href="mailto:angel.bel@myyahoo.com">angel.bel@myyahoo.com</a></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

module.exports = { sendApprovalEmail, sendRejectionEmail, sendAdminNotification, sendPasswordResetEmail };