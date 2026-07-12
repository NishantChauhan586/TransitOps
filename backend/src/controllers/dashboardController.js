import Bus from '../models/busModel.js';
import Route from '../models/routeModel.js';

/**
 * @desc    Get dashboard metrics and counts
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBuses,
      activeBuses,
      inactiveBuses,
      maintenanceBuses,
      totalRoutes,
      activeRoutes,
      inactiveRoutes,
      eastBuses,
      northBuses,
      southBuses,
      westBuses,
    ] = await Promise.all([
      Bus.countDocuments({}),
      Bus.countDocuments({ status: 'Active' }),
      Bus.countDocuments({ status: 'Inactive' }),
      Bus.countDocuments({ status: 'Maintenance' }),
      Route.countDocuments({}),
      Route.countDocuments({ status: 'Active' }),
      Route.countDocuments({ status: 'Inactive' }),
      Bus.countDocuments({ region: 'East' }),
      Bus.countDocuments({ region: 'North' }),
      Bus.countDocuments({ region: 'South' }),
      Bus.countDocuments({ region: 'West' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBuses,
        activeBuses,
        inactiveBuses,
        maintenanceBuses,
        totalRoutes,
        activeRoutes,
        inactiveRoutes,
        byRegion: {
          East:  eastBuses,
          North: northBuses,
          South: southBuses,
          West:  westBuses,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

