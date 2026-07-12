import express from 'express';
import {
  createBus,
  getAllBuses,
  getBusById,
  updateBus,
  deleteBus,
  getBusSeats,
} from '../controllers/busController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection middleware to all bus routes
router.use(protect);

// Routes
router.route('/')
  .post(createBus)
  .get(getAllBuses);

router.route('/:id/seats')
  .get(getBusSeats);

router.route('/:id')
  .get(getBusById)
  .put(updateBus)
  .delete(deleteBus);

export default router;
