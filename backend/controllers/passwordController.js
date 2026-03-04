/**
 * Password Reset Controller
 * Handles forgot password and reset password functionality
 * Uses crypto for secure token generation and nodemailer for email delivery
 */

const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

/**
 * Configure nodemailer transporter
 * Priority: ENV SMTP > Gmail > Ethereal (auto-created test account)
 */
const getTransporter = async () => {
  // Use environment variables if available
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Gmail with app password
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  // Fallback: Ethereal test account (emails viewable at ethereal.email)
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Created Ethereal test email account:');
  console.log(`   User: ${testAccount.user}`);
  console.log(`   Pass: ${testAccount.pass}`);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Forgot Password - Request password reset
 * POST /api/auth/forgot-password
 * 
 * Generates a secure token, stores it in the database with expiry,
 * and sends a reset link via email.
 * 
 * Security: Always returns success to prevent email enumeration.
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide an email address' });
    }

    // Generic success message (used regardless of whether email exists)
    const successMessage = 'If an account with that email exists, a password reset link has been sent.';

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      // Return same success message to prevent email enumeration
      return res.status(200).json({ message: successMessage });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (so even DB access won't reveal the token)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token and expiry (20 minutes from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
    await user.save({ hooks: false }); // Skip password hashing hook

    // Build reset URL (unhashed token goes in the URL)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER || '"CleanCart" <noreply@cleancart.com>',
      to: user.email,
      subject: 'CleanCart - Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fc; padding: 40px 20px;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">CleanCart</h1>
            </div>
            <h2 style="color: #1e1b4b; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Hello <strong>${user.name}</strong>,
            </p>
            <p style="color: #64748b; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
              This link will expire in <strong>20 minutes</strong>. If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              If the button doesn't work, paste this link in your browser:<br/>
              <a href="${resetURL}" style="color: #4f46e5; word-break: break-all;">${resetURL}</a>
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${user.email}`);

    // If using Ethereal, log the preview URL so you can view the email
    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log('========================================');
      console.log('📧 VIEW EMAIL AT ETHEREAL:');
      console.log(`   ${previewURL}`);
      console.log('========================================');
    }

    res.status(200).json({ message: successMessage });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

/**
 * Reset Password - Set new password using token
 * POST /api/auth/reset-password
 * 
 * Validates the token, checks expiry, hashes new password, and saves.
 * Token is invalidated after use.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [Op.gt]: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token. Please request a new password reset.' });
    }

    // Update password (will be hashed by model hook)
    user.password = newPassword;

    // Invalidate the reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    console.log(`✅ Password successfully reset for ${user.email}`);

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};
