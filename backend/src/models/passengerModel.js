import mongoose from 'mongoose';
import validator from 'validator';

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a passenger name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please add a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please select a gender'],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      required: [true, 'Please add an age'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Passenger = mongoose.model('Passenger', passengerSchema);

export default Passenger;
