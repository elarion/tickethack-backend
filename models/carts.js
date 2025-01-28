const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'trips', required: true}],
    createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('carts', cartSchema);

module.exports = Cart;