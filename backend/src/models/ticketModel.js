import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: String,
      required: [true, 'Please add a ticket number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger',
      required: [true, 'Please associate a passenger'],
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Please associate a bus'],
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Please associate a route'],
    },
    seatNumber: {
      type: String,
      required: [true, 'Please add a seat number'],
      trim: true,
    },
    fare: {
      type: Number,
      required: [true, 'Please add a fare amount'],
      min: [0, 'Fare cannot be negative'],
    },
    travelDate: {
      type: Date,
      required: [true, 'Please add a travel date'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Booked', 'Cancelled', 'Completed'],
      default: 'Booked',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate ticketNo if not provided
ticketSchema.pre('validate', async function () {
  if (!this.ticketNo) {
    const prefix = 'TKT';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
    this.ticketNo = `${prefix}-${randomNum}`;
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
