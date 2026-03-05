/**
 * Unit tests for Authentication Middleware
 * Tests with valid, invalid, malformed, and missing tokens
 */

const jwt = require('jsonwebtoken');
const authenticate = require('../../middleware/auth');
const { JWT_SECRET } = require('../../config/constants');
const User = require('../../models/User');

// Mock the User model
jest.mock('../../models/User');

// Helper to create mock Express req/res/next
const mockReqResNext = (overrides = {}) => {
  const req = { headers: {}, ...overrides };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('Authentication Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Missing token ---
  test('should return 401 when no Authorization header is provided', async () => {
    const { req, res, next } = mockReqResNext();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when Authorization header is empty string', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: '' },
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  // --- Malformed token ---
  test('should return 401 when Authorization header does not start with Bearer', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Basic some-token' },
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is malformed / not a valid JWT', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Bearer not-a-real-jwt' },
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  // --- Invalid token (wrong secret) ---
  test('should return 401 when token is signed with a different secret', async () => {
    const token = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '1h' });
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  // --- Expired token ---
  test('should return 401 when token is expired', async () => {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '0s' });

    // Small delay to ensure token is expired
    await new Promise((r) => setTimeout(r, 50));

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  // --- Valid token but user not found ---
  test('should return 401 when token is valid but user does not exist in DB', async () => {
    const token = jwt.sign({ userId: 999 }, JWT_SECRET, { expiresIn: '1h' });
    User.findByPk.mockResolvedValue(null);

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await authenticate(req, res, next);

    expect(User.findByPk).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  // --- Valid token and user exists ---
  test('should call next() and attach user to req when token is valid', async () => {
    const mockUser = { id: 1, name: 'Alice', email: 'alice@test.com', role: 'user' };
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });
    User.findByPk.mockResolvedValue(mockUser);

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await authenticate(req, res, next);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
