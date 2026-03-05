/**
 * Unit tests for Password Controller
 * Tests forgot password and reset password flows
 */

const crypto = require('crypto');
const User = require('../../models/User');
const nodemailer = require('nodemailer');

jest.mock('../../models/User');
jest.mock('nodemailer');

const passwordController = require('../../controllers/passwordController');

const mockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe('Password Controller - forgotPassword', () => {
  beforeEach(() => {
    // Mock nodemailer transporter
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    nodemailer.createTestAccount = jest.fn().mockResolvedValue({ user: 'test', pass: 'test' });
    nodemailer.createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });
    nodemailer.getTestMessageUrl = jest.fn().mockReturnValue(null);
  });

  afterEach(() => jest.clearAllMocks());

  test('should return 400 when email is missing', async () => {
    const req = { body: {} };
    const res = mockRes();

    await passwordController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide an email address' });
  });

  test('should return 200 with generic message when email does not exist (prevents enumeration)', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: 'nonexistent@test.com' } };
    const res = mockRes();

    await passwordController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  });

  test('should return 200 and send email when user exists', async () => {
    const mockUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@test.com',
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: 'alice@test.com' } };
    const res = mockRes();

    await passwordController.forgotPassword(req, res);

    // User should have a reset token and expiry set
    expect(mockUser.resetPasswordToken).toBeDefined();
    expect(mockUser.resetPasswordExpires).toBeDefined();
    expect(mockUser.save).toHaveBeenCalledWith({ hooks: false });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  });

  test('should set token expiry to ~20 minutes in the future', async () => {
    const mockUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@test.com',
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    const beforeTime = Date.now();
    const req = { body: { email: 'alice@test.com' } };
    const res = mockRes();

    await passwordController.forgotPassword(req, res);

    const expiryTime = new Date(mockUser.resetPasswordExpires).getTime();
    const twentyMinutes = 20 * 60 * 1000;
    expect(expiryTime).toBeGreaterThanOrEqual(beforeTime + twentyMinutes - 1000);
    expect(expiryTime).toBeLessThanOrEqual(beforeTime + twentyMinutes + 5000);
  });
});

describe('Password Controller - resetPassword', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 400 when token or password is missing', async () => {
    const req = { body: {} };
    const res = mockRes();

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token and new password are required' });
  });

  test('should return 400 when password is too short', async () => {
    const req = { body: { token: 'some-token', newPassword: '123', confirmPassword: '123' } };
    const res = mockRes();

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters long' });
  });

  test('should return 400 when passwords do not match', async () => {
    const req = {
      body: { token: 'some-token', newPassword: 'password123', confirmPassword: 'different' },
    };
    const res = mockRes();

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Passwords do not match' });
  });

  test('should return 400 when token is invalid or expired', async () => {
    User.findOne.mockResolvedValue(null);

    const req = {
      body: { token: 'invalid-token', newPassword: 'password123', confirmPassword: 'password123' },
    };
    const res = mockRes();

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired reset token. Please request a new password reset.',
    });
  });

  test('should return 200 and reset password when token is valid', async () => {
    const mockUser = {
      id: 1,
      email: 'alice@test.com',
      resetPasswordToken: 'hashed-token',
      resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000),
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = {
      body: { token: 'some-token', newPassword: 'newpass123', confirmPassword: 'newpass123' },
    };
    const res = mockRes();

    await passwordController.resetPassword(req, res);

    expect(mockUser.password).toBe('newpass123');
    expect(mockUser.resetPasswordToken).toBeNull();
    expect(mockUser.resetPasswordExpires).toBeNull();
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  });
});
