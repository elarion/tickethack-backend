const mongoose = require('mongoose');

const tripSchema = mongoose.Schema({
    arrival: {type: String},
    departure: {type: String},
    date: {type: Date},
    price: {type: Number}
});

const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;