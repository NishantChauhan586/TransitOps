import Bus from '../models/busModel.js';
import Ticket from '../models/ticketModel.js';

/**
 * @desc    Create a new bus
 * @route   POST /api/buses
 * @access  Private
 */
export const createBus = async (req, res, next) => {
  try {
    const {
      busNumber,
      busName,
      capacity,
      driverName,
      driverPhone,
      route,
      status,
      currentLocation,
    } = req.body;

    // Check if bus number already exists
    const busExists = await Bus.findOne({ busNumber });
    if (busExists) {
      res.status(400);
      throw new Error('Bus number already registered');
    }

    const bus = await Bus.create({
      busNumber,
      busName,
      capacity,
      driverName,
      driverPhone,
      route: route || null,
      status,
      currentLocation,
    });

    res.status(201).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all buses
 * @route   GET /api/buses
 * @access  Private
 */
export const getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find({});
    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single bus by ID
 * @route   GET /api/buses/:id
 * @access  Private
 */
export const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a bus
 * @route   PUT /api/buses/:id
 * @access  Private
 */
export const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }

    // Update fields if provided in request body
    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedBus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a bus
 * @route   DELETE /api/buses/:id
 * @access  Private
 */
export const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }

    await Bus.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booked seats for a bus on a date
 * @route   GET /api/buses/:id/seats
 * @access  Private
 */
export const getBusSeats = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }

    const { date } = req.query;
    if (!date) {
      res.status(400);
      throw new Error('Please provide a date query parameter (YYYY-MM-DD)');
    }

    // Match travelDate for the entire day
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    const activeTickets = await Ticket.find({
      bus: req.params.id,
      travelDate: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' },
    });

    const bookedSeats = activeTickets.map((tkt) => tkt.seatNumber);

    res.status(200).json({
      success: true,
      data: {
        capacity: bus.capacity,
        bookedSeats,
      },
    });
  } catch (error) {
    next(error);
  }
};

