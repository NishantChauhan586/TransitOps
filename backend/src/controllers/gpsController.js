import GPS from '../models/gpsModel.js';
import Bus from '../models/busModel.js';

/**
 * @desc    Update GPS location for a bus
 * @route   POST /api/gps/update
 * @access  Private
 */
export const updateGPS = async (req, res, next) => {
  try {
    const { bus, latitude, longitude, speed, heading } = req.body;

    // 1. Verify bus exists
    const busExists = await Bus.findById(bus);
    if (!busExists) {
      res.status(404);
      throw new Error('Bus not found');
    }

    // 2. Create GPS log entry
    const gpsLog = await GPS.create({
      bus,
      latitude,
      longitude,
      speed: speed || 0,
      heading: heading || 0,
    });

    // 3. Update Bus currentLocation field
    await Bus.findByIdAndUpdate(bus, {
      $set: {
        currentLocation: {
          latitude,
          longitude,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: gpsLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all GPS logs
 * @route   GET /api/gps
 * @access  Private
 */
export const getAllGPS = async (req, res, next) => {
  try {
    const gpsLogs = await GPS.find({})
      .populate('bus', 'busNumber busName driverName driverPhone status')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: gpsLogs.length,
      data: gpsLogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get GPS logs by Bus ID
 * @route   GET /api/gps/:busId
 * @access  Private
 */
export const getGPSByBusId = async (req, res, next) => {
  try {
    const { busId } = req.params;

    // Verify if bus exists
    const busExists = await Bus.findById(busId);
    if (!busExists) {
      res.status(404);
      throw new Error('Bus not found');
    }

    const gpsLogs = await GPS.find({ bus: busId })
      .populate('bus', 'busNumber busName driverName driverPhone status')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: gpsLogs.length,
      data: gpsLogs,
    });
  } catch (error) {
    next(error);
  }
};
