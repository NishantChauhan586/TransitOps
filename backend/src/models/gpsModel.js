import mongoose from 'mongoose';

const gpsSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Please associate a bus ID'],
    },
    latitude: {
      type: Number,
      required: [true, 'Please add latitude'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please add longitude'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
      min: [0, 'Heading must be at least 0 degrees'],
      max: [360, 'Heading cannot exceed 360 degrees'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

const GPS = mongoose.model('GPS', gpsSchema);

export default GPS;
