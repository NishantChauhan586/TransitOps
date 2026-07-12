import express from 'express';
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} from '../controllers/routeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with authMiddleware
router.use(protect);

router.route('/')
  .post(createRoute)
  .get(getAllRoutes);

router.route('/:id')
  .get(getRouteById)
  .put(updateRoute)
  .delete(deleteRoute);

export default router;
