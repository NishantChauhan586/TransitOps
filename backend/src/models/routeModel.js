import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, 'Please add a route number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    routeName: {
      type: String,
      required: [true, 'Please add a route name'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Please add source location'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please add destination location'],
      trim: true,
    },
    stops: {
      type: [String],
      default: [],
    },
    distance: {
      type: Number,
      required: [true, 'Please add route distance in km'],
      min: [0, 'Distance cannot be negative'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'Please add estimated travel time'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.model('Route', routeSchema);

export default Route;
