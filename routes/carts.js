const express = require('express');
const router = express.Router();

const Cart = require('../models/carts');
const Trip = require('../models/trips');

const { getHoursFromDate } = require('../modules/helpers');

/** Middleware */
// Check if the tripID field exists in the request body and if the trip exists
async function isTripValid(req, res, next) {
    const { tripID } = req.body;

    // If the tripID field does not exist in the request body, return an error message
    if (!tripID) {
        return res.status(400).json({ result: false, messages: `The field tripID is required in body.` });
    }

    // Find the trip with the tripID
    const trip = await Trip.findById(tripID);

    // If the trip does not exist, return an error message
    if (trip === null) {
        return res.status(400).json({ result: false, messages: `The trip does not exist.` });
    }

    next();
}

// Check if the cart exists
async function isCartExists(req, res, next) {
    // Find the cart
    const exist = await Cart.findOne({});

    // If the cart does not exist, return an error message
    if (exist === null) {
        return res.json({ result: false, message: 'Cart does not exist' });
    }

    next();
}
/** END OF Middleware */

/** Routes */
// Route GET /all to get all of the trips in the cart
router.get('/', async (req, res, next) => {
    try {
        // Find the cart and populate the trips to get the trip details
        // And use lean() to get a plain JavaScript object
        const cart = await Cart.findOne({}).populate('trips').lean();

        // If the cart does not exist, return an empty cart with result false
        if (cart === null) {
            return res.json({ result: false, cart: {} });
        }

        // Loop through the trips in the cart and get the hours from the date
       for (const trip of cart.trips) {
            trip.hours = getHoursFromDate(trip.date);
        }

        return res.json({ result: true, cart: cart });
    } catch (e) {
        // If there is an error, return an error message
        console.error('Error With Route GET /carts =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route GET /all */


// Route POST /save to save a trip to the cart using middleware isTripValid
// To check if the tripID field exists in the request body and if the trip exists
router.post('/save', isTripValid, async (req, res, next) => {
    // Destrcuture the tripID from the request body
    const {tripID} = req.body;

    try {
        // Find the cart and add the trip to the cart using findOneAndUpdate
        // $addToSet adds the trip to the trips array if it does not exist
        // The upsert option creates the cart if it does not exist and the new option returns the updated cart
        const cart = await Cart.findOneAndUpdate(
            {},
            { $addToSet: { trips: tripID } },
            { upsert: true, new: true }
        );

        return res.json({ result: true, cartID: cart._id});
    } catch (e) {
        // If there is an error, return an error message
        console.error('Error With Route POST /carts/save =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route POST /save */


// Route DELETE /delete/:tripID using middleware isCartExists to check if the cart exists
router.delete('/delete/:tripID', isCartExists, async (req, res, next) => {
    // Destrcuture the tripID from the request params
    const { tripID } = req.params;

    try {
        // Find the cart and remove the trip from the cart using findOneAndUpdate
        // $pull removes the trip from the trips array
        // The new option returns the updated cart
        const updatedCart = await Cart.findOneAndUpdate(
            {},
            { $pull: { trips: tripID } },
            { new: true } 
        );

        // If the cart is empty, delete the cart
        if (updatedCart.trips.length === 0) {
            // Delete the cart using deleteOne method on the updatedCart
            await updatedCart.deleteOne();
            return res.json({ result: true, message: 'Cart deleted because it is empty' });
        }

        return res.json({ result: true, message: 'Trip deleted' });
    } catch (e) {
        // If there is an error, return an error message
        console.error('Error With Route DELETE /carts/delete/:cartID =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route POST /delete/:cartID */
/** END OF Routes */


module.exports = router;