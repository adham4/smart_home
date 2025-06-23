const { login } = require('../controllers/auth.controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
  },
}));

describe('Auth Controller - login', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        username: 'admin',
        password: '1234',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return 401 if user not found', async () => {
    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'admin' } });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
  });

  it('should return 401 if password is incorrect', async () => {
    User.findOne.mockResolvedValue({ password: 'hashedPass' });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashedPass');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
  });

  it('should return token if login is successful', async () => {
    const mockUser = { id: 1, username: 'admin', password: 'hashedPass' };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-token');

    await login(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser.id, username: mockUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    expect(res.json).toHaveBeenCalledWith({ success: true, token: 'fake-token' });
  });

  it('should return 500 on server error', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' });
  });
});``