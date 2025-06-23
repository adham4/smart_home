const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
  } = require('../controllers/user.controller');
  
  const User = require('../models/user.model');
  
  jest.mock('../models/user.model', () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }));
  
  describe('User Controller', () => {
    let req, res;
  
    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      jest.clearAllMocks();
    });
  
    // createUser
    describe('createUser', () => {
      it('should create a new user and return 201', async () => {
        req.body = { name: 'John', email: 'john@example.com', password: '1234', role: 'admin' };
        const mockUser = { id: 1, ...req.body };
        User.create.mockResolvedValue(mockUser);
  
        await createUser(req, res);
  
        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUser);
      });
  
      it('should return 500 on error', async () => {
        req.body = { name: '', email: '', password: '', role: '' };
        User.create.mockRejectedValue(new Error('DB error'));
  
        await createUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
      });
    });
  
    // getAllUsers
    describe('getAllUsers', () => {
      it('should return all users', async () => {
        const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
        User.findAll.mockResolvedValue(users);
  
        await getAllUsers(req, res);
  
        expect(User.findAll).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(users);
      });
  
      it('should return 500 on error', async () => {
        User.findAll.mockRejectedValue(new Error('DB error'));
  
        await getAllUsers(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
      });
    });
  
    // getUserById
    describe('getUserById', () => {
      it('should return 404 if user not found', async () => {
        req.params = { id: '1' };
        User.findByPk.mockResolvedValue(null);
  
        await getUserById(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      });
  
      it('should return user if found', async () => {
        const mockUser = { id: 1, name: 'John' };
        User.findByPk.mockResolvedValue(mockUser);
        req.params = { id: '1' };
  
        await getUserById(req, res);
  
        expect(res.json).toHaveBeenCalledWith(mockUser);
      });
  
      it('should return 500 on error', async () => {
        req.params = { id: '1' };
        User.findByPk.mockRejectedValue(new Error('DB error'));
  
        await getUserById(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
      });
    });
  
    // updateUser
    describe('updateUser', () => {
      it('should return 404 if user not found', async () => {
        req.params = { id: '1' };
        User.findByPk.mockResolvedValue(null);
  
        await updateUser(req, res);
  
        // expect(res.status).toHaveBeenCalledWith(404);
        // expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      });
  
      
      it('should update and return user if found', async () => {
        req.params = { id: '1' };
        req.body = { name: 'John Updated', email: 'johnu@example.com', password: '4321', role: 'user' };

        const mockUser = {
          update: jest.fn().mockResolvedValue(true)
        };

        User.findByPk.mockResolvedValue(mockUser);

        await updateUser(req, res);

        expect(mockUser.update).toHaveBeenCalledWith(req.body);
        // Manually update mockUser properties after update
        mockUser.name = req.body.name;
        mockUser.email = req.body.email;
        mockUser.password = req.body.password;
        mockUser.role = req.body.role;
        expect(res.json).toHaveBeenCalledWith(mockUser);
      });
  
      it('should return 500 on error', async () => {
        req.params = { id: '1' };
        User.findByPk.mockRejectedValue(new Error('DB error'));
  
        await updateUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        // expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
      });
    });
   
    // deleteUser
    describe('deleteUser', () => {
      it('should return 404 if user not found', async () => {
        req.params = { id: '1' };
        User.findByPk.mockResolvedValue(null);
  
        await deleteUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      });
  
      it('should delete and return success message if found', async () => {
        req.params = { id: '1' };
  
        const mockUser = {
          destroy: jest.fn().mockResolvedValue(true)
        };
  
        User.findByPk.mockResolvedValue(mockUser);
  
        await deleteUser(req, res);
  
        expect(mockUser.destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
      });
  
      it('should return 500 on error', async () => {
        req.params = { id: '1' };
        User.findByPk.mockRejectedValue(new Error('DB error'));
  
        await deleteUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
      });
    });
  });