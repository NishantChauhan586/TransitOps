import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please add a bus number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    busName: {
      type: String,
      required: [true, 'Please add a bus name'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    driverName: {
      type: String,
      trim: true,
      default: '',
    },
    driverPhone: {
      type: String,
      trim: true,
      default: '',
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    region: {
      type: String,
      enum: ['East', 'North', 'South', 'West'],
      default: 'North',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Maintenance'],
      default: 'Active',
    },
    currentLocation: {
      latitude:  { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model('Bus', busSchema);

export default Bus;
