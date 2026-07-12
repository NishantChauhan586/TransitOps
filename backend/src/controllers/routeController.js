import Route from '../models/routeModel.js';

/**
 * @desc    Create a new route
 * @route   POST /api/routes
 * @access  Private
 */
export const createRoute = async (req, res, next) => {
  try {
    const {
      routeNumber,
      routeName,
      source,
      destination,
      stops,
      distance,
      estimatedTime,
      status,
    } = req.body;

    // Check if route number already exists
    const routeExists = await Route.findOne({ routeNumber });
    if (routeExists) {
      res.status(400);
      throw new Error('Route number already registered');
    }

    const route = await Route.create({
      routeNumber,
      routeName,
      source,
      destination,
      stops: stops || [],
      distance,
      estimatedTime,
      status,
    });

    res.status(201).json({
      success: true,
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all routes
 * @route   GET /api/routes
 * @access  Private
 */
export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({});
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single route by ID
 * @route   GET /api/routes/:id
 * @access  Private
 */
export const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a route
 * @route   PUT /api/routes/:id
 * @access  Private
 */
export const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedRoute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a route
 * @route   DELETE /api/routes/:id
 * @access  Private
 */
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }

    await Route.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
