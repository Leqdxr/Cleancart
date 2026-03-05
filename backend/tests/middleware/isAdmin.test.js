/**
 * Unit tests for Admin Authorization Middleware
 * Tests admin role verification with various scenarios
 */

const jwt = require('jsonwebtoken');
const isAdmin = require('../../middleware/isAdmin');
const { JWT_SECRET } = require('../../config/constants');
const User = require('../../models/User');

jest.mock('../../models/User');

const mockReqResNext = (overrides = {}) => {
  const req = { headers: {}, ...overrides };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('isAdmin Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 when no Authorization header is provided', async () => {
    const { req, res, next } = mockReqResNext();

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is invalid', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Bearer invalid-token' },
    });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when valid token but user not found', async () => {
    const token = jwt.sign({ userId: 999 }, JWT_SECRET, { expiresIn: '1h' });
    User.findByPk.mockResolvedValue(null);

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 when user is not an admin', async () => {
    const regularUser = { id: 2, name: 'Bob', email: 'bob@test.com', role: 'user' };
    const token = jwt.sign({ userId: 2 }, JWT_SECRET, { expiresIn: '1h' });
    User.findByPk.mockResolvedValue(regularUser);

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Admin privileges required.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() when user has admin role', async () => {
    const adminUser = { id: 1, name: 'Admin', email: 'someone@test.com', role: 'admin' };
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });
    User.findByPk.mockResolvedValue(adminUser);

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await isAdmin(req, res, next);

    expect(req.user).toEqual(adminUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should call next() when user has admin@cleancart.com email (demo admin)', async () => {
    const demoAdmin = { id: 3, name: 'Demo Admin', email: 'admin@cleancart.com', role: 'user' };
    const token = jwt.sign({ userId: 3 }, JWT_SECRET, { expiresIn: '1h' });
    User.findByPk.mockResolvedValue(demoAdmin);

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await isAdmin(req, res, next);

    expect(req.user).toEqual(demoAdmin);
    expect(next).toHaveBeenCalled();
  });
});
