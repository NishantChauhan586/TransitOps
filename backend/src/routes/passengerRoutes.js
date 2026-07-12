import express from 'express';
import {
  createPassenger,
  getAllPassengers,
  getPassengerById,
  updatePassenger,
  deletePassenger,
} from '../controllers/passengerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all passenger routes
router.use(protect);

router.route('/')
  .post(createPassenger)
  .get(getAllPassengers);

router.route('/:id')
  .get(getPassengerById)
  .put(updatePassenger)
  .delete(deletePassenger);

export default router;
