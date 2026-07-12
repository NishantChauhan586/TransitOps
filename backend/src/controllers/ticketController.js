import Ticket from '../models/ticketModel.js';

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private
 */
export const createTicket = async (req, res, next) => {
  try {
    const {
      ticketNo,
      passenger,
      bus,
      route,
      seatNumber,
      fare,
      travelDate,
      bookingDate,
      status,
      paymentStatus,
    } = req.body;

    // Check if the seat is already booked for this bus and date
    const start = new Date(travelDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(travelDate);
    end.setUTCHours(23, 59, 59, 999);

    const existingTicket = await Ticket.findOne({
      bus,
      seatNumber,
      travelDate: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' },
    });

    if (existingTicket) {
      res.status(400);
      throw new Error('Seat is already booked for this bus and date');
    }

    const ticket = await Ticket.create({
      ticketNo,
      passenger,
      bus,
      route,
      seatNumber,
      fare,
      travelDate,
      bookingDate,
      status,
      paymentStatus,
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tickets
 * @route   GET /api/tickets
 * @access  Private
 */
export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({})
      .populate('passenger')
      .populate('bus')
      .populate('route');

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private
 */
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('passenger')
      .populate('bus')
      .populate('route');

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a ticket
 * @route   PUT /api/tickets/:id
 * @access  Private
 */
export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const targetBus = req.body.bus || ticket.bus;
    const targetDate = req.body.travelDate || ticket.travelDate;
    const targetSeat = req.body.seatNumber || ticket.seatNumber;
    const targetStatus = req.body.status || ticket.status;

    if (targetStatus !== 'Cancelled') {
      const start = new Date(targetDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(targetDate);
      end.setUTCHours(23, 59, 59, 999);

      const existingTicket = await Ticket.findOne({
        _id: { $ne: req.params.id },
        bus: targetBus,
        seatNumber: targetSeat,
        travelDate: { $gte: start, $lte: end },
        status: { $ne: 'Cancelled' },
      });

      if (existingTicket) {
        res.status(400);
        throw new Error('Seat is already booked for this bus and date');
      }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
