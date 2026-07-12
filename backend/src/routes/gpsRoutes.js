import express from 'express';
import {
  updateGPS,
  getAllGPS,
  getGPSByBusId,
} from '../controllers/gpsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with authMiddleware
router.use(protect);

router.post('/update', updateGPS);
router.get('/', getAllGPS);
router.get('/:busId', getGPSByBusId);

export default router;
