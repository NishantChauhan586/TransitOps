import Passenger from '../models/passengerModel.js';

/**
 * @desc    Create a new passenger
 * @route   POST /api/passengers
 * @access  Private
 */
export const createPassenger = async (req, res, next) => {
  try {
    const { name, email, phone, gender, age, address } = req.body;

    // Check if email already registered
    const emailExists = await Passenger.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Passenger with this email already registered');
    }

    const passenger = await Passenger.create({
      name,
      email,
      phone,
      gender,
      age,
      address,
    });

    res.status(201).json({
      success: true,
      data: passenger,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all passengers
 * @route   GET /api/passengers
 * @access  Private
 */
export const getAllPassengers = async (req, res, next) => {
  try {
    const passengers = await Passenger.find({});
    res.status(200).json({
      success: true,
      count: passengers.length,
      data: passengers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get passenger by ID
 * @route   GET /api/passengers/:id
 * @access  Private
 */
export const getPassengerById = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      res.status(404);
      throw new Error('Passenger not found');
    }

    res.status(200).json({
      success: true,
      data: passenger,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a passenger
 * @route   PUT /api/passengers/:id
 * @access  Private
 */
export const updatePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      res.status(404);
      throw new Error('Passenger not found');
    }

    const updatedPassenger = await Passenger.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPassenger,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a passenger
 * @route   DELETE /api/passengers/:id
 * @access  Private
 */
export const deletePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      res.status(404);
      throw new Error('Passenger not found');
    }

    await Passenger.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Passenger deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
