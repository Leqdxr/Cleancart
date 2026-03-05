/**
 * Unit tests for Admin Controller
 * Tests user CRUD operations with mocked database
 */

const User = require('../../models/User');

jest.mock('../../models/User');

const adminController = require('../../controllers/adminController');

const mockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe('Admin Controller - getAllUsers', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 200 with list of users', async () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@test.com' },
      { id: 2, name: 'Bob', email: 'bob@test.com' },
    ];
    User.findAll.mockResolvedValue(users);

    const req = {};
    const res = mockRes();

    await adminController.getAllUsers(req, res);

    expect(User.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'name', 'email', 'profilePicture', 'createdAt', 'updatedAt'],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ users });
  });

  test('should return 200 with empty array when no users exist', async () => {
    User.findAll.mockResolvedValue([]);

    const req = {};
    const res = mockRes();

    await adminController.getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ users: [] });
  });

  test('should return 500 when database error occurs', async () => {
    User.findAll.mockRejectedValue(new Error('DB error'));

    const req = {};
    const res = mockRes();

    await adminController.getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch users' });
  });
});

describe('Admin Controller - getUserById', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 200 with user when found', async () => {
    const user = { id: 1, name: 'Alice', email: 'alice@test.com' };
    User.findByPk.mockResolvedValue(user);

    const req = { params: { id: '1' } };
    const res = mockRes();

    await adminController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  test('should return 404 when user is not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const req = { params: { id: '999' } };
    const res = mockRes();

    await adminController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});

describe('Admin Controller - updateUser', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 404 when user to update is not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const req = { params: { id: '999' }, body: { name: 'New Name' } };
    const res = mockRes();

    await adminController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  test('should return 400 when updating to email already in use', async () => {
    const existingUser = { id: 1, email: 'alice@test.com', save: jest.fn() };
    const otherUser = { id: 2, email: 'taken@test.com' };

    User.findByPk.mockResolvedValue(existingUser);
    User.findOne.mockResolvedValue(otherUser);

    const req = { params: { id: '1' }, body: { email: 'taken@test.com' } };
    const res = mockRes();

    await adminController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already in use by another user' });
  });

  test('should return 400 when password is too short', async () => {
    const mockUser = { id: 1, email: 'alice@test.com', save: jest.fn() };
    User.findByPk.mockResolvedValue(mockUser);

    const req = { params: { id: '1' }, body: { password: '123' } };
    const res = mockRes();

    await adminController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters long' });
  });

  test('should return 200 and update user successfully', async () => {
    const mockUser = {
      id: 1, name: 'Alice', email: 'alice@test.com', profilePicture: null, role: 'user',
      save: jest.fn().mockResolvedValue(true),
    };
    User.findByPk.mockResolvedValue(mockUser);

    const req = { params: { id: '1' }, body: { name: 'Alice Updated' } };
    const res = mockRes();

    await adminController.updateUser(req, res);

    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.message).toBe('User updated successfully');
    expect(responseBody.user.name).toBe('Alice Updated');
  });
});

describe('Admin Controller - deleteUser', () => {
  afterEach(() => jest.clearAllMocks());

  test('should return 404 when user to delete is not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const req = { params: { id: '999' }, user: { id: 1 } };
    const res = mockRes();

    await adminController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  test('should return 400 when admin tries to delete themselves', async () => {
    const mockUser = { id: 1, name: 'Admin', destroy: jest.fn() };
    User.findByPk.mockResolvedValue(mockUser);

    const req = { params: { id: '1' }, user: { id: 1 } };
    const res = mockRes();

    await adminController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'You cannot delete your own account' });
    expect(mockUser.destroy).not.toHaveBeenCalled();
  });

  test('should return 200 when user is deleted successfully', async () => {
    const mockUser = { id: 2, name: 'Bob', destroy: jest.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(mockUser);

    const req = { params: { id: '2' }, user: { id: 1 } };
    const res = mockRes();

    await adminController.deleteUser(req, res);

    expect(mockUser.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });
});
