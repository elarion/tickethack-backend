const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'trips', required: true}],
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;