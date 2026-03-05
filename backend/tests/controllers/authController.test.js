/**
 * Unit tests for Auth Controller
 * Tests register and login validation, token generation, and error handling
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/constants');
const User = require('../../models/User');

// Mock User model at module level
jest.mock('../../models/User');

const authController = require('../../controllers/authController');

const mockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe('Auth Controller - register', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 400 when required fields are missing', async () => {
    const req = { body: { name: '', email: '', password: '' } };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide all required fields' });
  });

  test('should return 400 when passwords do not match', async () => {
    const req = {
      body: { name: 'Test', email: 'test@test.com', password: 'password123', confirmPassword: 'different' },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Passwords do not match' });
  });

  test('should return 400 when password is too short', async () => {
    const req = {
      body: { name: 'Test', email: 'test@test.com', password: '123', confirmPassword: '123' },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters long' });
  });

  test('should return 400 when email already exists', async () => {
    User.findOne.mockResolvedValue({ id: 1, email: 'taken@test.com' });

    const req = {
      body: { name: 'Test', email: 'taken@test.com', password: 'password123', confirmPassword: 'password123' },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User with this email already exists' });
  });

  test('should return 201 with token and user on successful registration', async () => {
    User.findOne.mockResolvedValue(null);
    const createdUser = { id: 5, name: 'Alice', email: 'alice@test.com', profilePicture: null, role: 'user' };
    User.create.mockResolvedValue(createdUser);

    const req = {
      body: { name: 'Alice', email: 'alice@test.com', password: 'password123', confirmPassword: 'password123' },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.message).toBe('User registered successfully');
    expect(responseBody.token).toBeDefined();
    expect(responseBody.user.email).toBe('alice@test.com');

    // Verify the token is valid
    const decoded = jwt.verify(responseBody.token, JWT_SECRET);
    expect(decoded.userId).toBe(5);
  });
});

describe('Auth Controller - login', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 400 when email or password is missing', async () => {
    const req = { body: { email: '', password: '' } };
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide email and password' });
  });

  test('should return 401 when user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: 'nobody@test.com', password: 'password123' } };
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  test('should return 401 when password is incorrect', async () => {
    const mockUser = {
      id: 1,
      email: 'user@test.com',
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: 'user@test.com', password: 'wrongpass' } };
    const res = mockRes();

    await authController.login(req, res);

    expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpass');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  test('should return 200 with token on successful login', async () => {
    const mockUser = {
      id: 1,
      name: 'Bob',
      email: 'bob@test.com',
      profilePicture: null,
      role: 'user',
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: 'bob@test.com', password: 'password123' } };
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.message).toBe('Login successful');
    expect(responseBody.token).toBeDefined();
    expect(responseBody.user.name).toBe('Bob');
  });
});

describe('Auth Controller - getProfile', () => {
  test('should return 200 with user profile', async () => {
    const req = {
      user: { id: 1, name: 'Alice', email: 'alice@test.com', profilePicture: null, role: 'user' },
    };
    const res = mockRes();

    await authController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: { id: 1, name: 'Alice', email: 'alice@test.com', profilePicture: null, role: 'user' },
    });
  });
});

describe('Auth Controller - updateProfile', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 400 when name is empty whitespace', async () => {
    const req = {
      user: { id: 1, name: 'Alice', email: 'a@test.com', save: jest.fn() },
      body: { name: '   ' },
    };
    const res = mockRes();

    await authController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Name cannot be empty' });
  });

  test('should return 400 when changing password without current password', async () => {
    const req = {
      user: { id: 1, name: 'Alice', email: 'a@test.com', save: jest.fn() },
      body: { newPassword: 'newpass123' },
    };
    const res = mockRes();

    await authController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Current password is required to set a new password' });
  });

  test('should return 401 when current password is incorrect', async () => {
    const req = {
      user: {
        id: 1, name: 'Alice', email: 'a@test.com',
        comparePassword: jest.fn().mockResolvedValue(false),
        save: jest.fn(),
      },
      body: { currentPassword: 'wrong', newPassword: 'newpass123' },
    };
    const res = mockRes();

    await authController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
  });

  test('should return 200 and update name successfully', async () => {
    const mockUser = {
      id: 1, name: 'Alice', email: 'a@test.com', profilePicture: null, role: 'user',
      save: jest.fn().mockResolvedValue(true),
    };
    const req = {
      user: mockUser,
      body: { name: 'Alice Updated' },
    };
    const res = mockRes();

    await authController.updateProfile(req, res);

    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.user.name).toBe('Alice Updated');
  });
});
