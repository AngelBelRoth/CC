const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD // Your email password or app password
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
      <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}/login">Click here to login</a></p>
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

const sendAdminNotification = async (userName, userEmail) => {
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

module.exports = { sendApprovalEmail, sendRejectionEmail, sendAdminNotification };