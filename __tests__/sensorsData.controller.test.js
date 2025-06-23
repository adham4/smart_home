const {
    getSensorsDataById,
    createSensorsData,
    updateSensorsData,
    deleteSensorsData,
    getLatestSensorsData,
    controlDevice,
    receiveESP32Data
  } = require('../controllers/sensorsData.controller');
  
  const SensorsData = require('../models/sensorsData.model');
  
  jest.mock('../models/sensorsData.model', () => ({
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn()
  }));
  
  describe('SensorsData Controller', () => {
    let req, res;
  
    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      jest.clearAllMocks();
    });
  
    // getSensorsDataById
    describe('getSensorsDataById', () => {
      it('should return 404 if data not found', async () => {
        req.params = { id: '1' };
        SensorsData.findByPk.mockResolvedValue(null);
  
        await getSensorsDataById(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Sensor data not found' });
      });
  
      it('should return data if found', async () => {
        req.params = { id: '1' };
        const mockData = { id: '1', data_type: 'temperature', value: 33 };
        SensorsData.findByPk.mockResolvedValue(mockData);
  
        await getSensorsDataById(req, res);
  
        expect(res.json).toHaveBeenCalledWith(mockData);
      });
    });
  
    // createSensorsData
    describe('createSensorsData', () => {
      it('should return 400 if payload is invalid', async () => {
        req.body = { device_id: '', readings: null };
  
        await createSensorsData(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid payload. Expected device_id and readings object."
        });
      });
  
      it('should create entries for exceeded thresholds only', async () => {
        req.body = {
          device_id: 'device123',
          readings: { temperature: 35, humidity: 50, gas: 500 }
        };
  
        const mockCreated = [
          { id: 1, device_id: 'device123', data_type: 'temperature', value: 35 },
          { id: 2, device_id: 'device123', data_type: 'gas', value: 500 }
        ];
  
        SensorsData.create
          .mockResolvedValueOnce(mockCreated[0])
          .mockResolvedValueOnce(mockCreated[1]);
  
        await createSensorsData(req, res);
  
        expect(SensorsData.create).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Sensor data recorded successfully.",
          data: mockCreated
        });
      });
    });
  
    // updateSensorsData
    describe('updateSensorsData', () => {
      it('should return 404 if data not found', async () => {
        req.params = { id: '1' };
        req.body = { sensorType: 'temperature', value: 40, timestamp: new Date() };
        SensorsData.findByPk.mockResolvedValue(null);
  
        await updateSensorsData(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Sensor data not found' });
      });
  
      it('should update and return data if found', async () => {
        req.params = { id: '1' };
        req.body = { sensorType: 'temperature', value: 40, timestamp: new Date() };
  
        const mockData = {
          update: jest.fn().mockResolvedValue(true)
        };
  
        SensorsData.findByPk.mockResolvedValue(mockData);
  
        await updateSensorsData(req, res);
  
        expect(mockData.update).toHaveBeenCalledWith(req.body);
        expect(res.json).toHaveBeenCalledWith(mockData);
      });
    });
  
    // deleteSensorsData
    describe('deleteSensorsData', () => {
      it('should return 404 if data not found', async () => {
        req.params = { id: '1' };
        SensorsData.findByPk.mockResolvedValue(null);
  
        await deleteSensorsData(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Sensor data not found' });
      });
  
      it('should delete and return success message if found', async () => {
        req.params = { id: '1' };
  
        const mockData = {
          destroy: jest.fn().mockResolvedValue(true)
        };
  
        SensorsData.findByPk.mockResolvedValue(mockData);
  
        await deleteSensorsData(req, res);
  
        expect(mockData.destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'Sensor data deleted successfully' });
      });
    });
  
    // getLatestSensorsData
    describe('getLatestSensorsData', () => {
      it('should return latest data for sensor types', async () => {
        const sensorTypes = ['temperature', 'humidity', 'light', 'motion', 'gas', 'flame', 'rain', 'door'];
        const mockValues = {
          temperature: { value: 22 },
          humidity: { value: 55 },
          light: null,
          motion: { value: 1 },
          gas: { value: 100 },
          flame: null,
          rain: null,
          door: { value: 0 }
        };
  
        let callIndex = 0;
        SensorsData.findOne.mockImplementation(({ where }) => {
          const type = where.data_type;
          return Promise.resolve(mockValues[type] || null);
        });
  
        await getLatestSensorsData(req, res);
  
        expect(res.json).toHaveBeenCalledWith({
          temperature: 22,
          humidity: 55,
          motion: 1,
          gas: 100,
          door: 0
        });
      });
    });
  
    // controlDevice
    describe('controlDevice', () => {
      it('should return 400 if payload is invalid', () => {
        req.body = { deviceId: '', action: 'invalid' };
  
        controlDevice(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid payload. Required: deviceId and action (on/off)"
        });
      });
  
      it('should return success message if valid payload', () => {
        req.body = { deviceId: 'dev1', action: 'on' };
  
        controlDevice(req, res);
  
        expect(res.json).toHaveBeenCalledWith({
          message: 'Device dev1 set to on'
        });
      });
    });
  
    // receiveESP32Data
    describe('receiveESP32Data', () => {
      it('should return 400 if payload invalid', async () => {
        req.body = { device_id: '', readings: null };
  
        await receiveESP32Data(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid payload. Expected device_id and readings object."
        });
      });
  
      it('should save all readings and return 201', async () => {
        req.body = {
          device_id: 'device123',
          readings: {
            temperature: 25,
            humidity: 60
          }
        };
  
        const savedEntries = [
          { id: 1, device_id: 'device123', data_type: 'temperature', value: 25 },
          { id: 2, device_id: 'device123', data_type: 'humidity', value: 60 }
        ];
  
        SensorsData.create
          .mockResolvedValueOnce(savedEntries[0])
          .mockResolvedValueOnce(savedEntries[1]);
  
        await receiveESP32Data(req, res);
  
        expect(SensorsData.create).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "ESP32 data saved successfully.",
          data: savedEntries
        });
      });
    });
  });