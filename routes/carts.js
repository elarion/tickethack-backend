const express = require('express');
const router = express.Router();

const Cart = require('../models/carts');
const Trip = require('../models/trips');

const { getHoursFromDate } = require('../modules/helpers');

/** Middleware */

async function isTripValid(req, res, next) {
    const { tripID } = req.body;

    if (!tripID) {
        return res.status(400).json({ result: false, messages: `The field tripID is required in body.` });
    }

    const trip = await Trip.findById(tripID);

    if (tripID === null) {
        return res.status(400).json({ result: false, messages: `The trip does not exist.` });
    }

    next();
}

async function isCartExists(req, res, next) {
    // if (!req.params.cartID) {
    //     return res.json({ result: false, message: 'Missing cartID field in params' });
    // }

    const exist = await Cart.findOne({});

    if (exist === null) {
        return res.json({ result: false, message: 'Cart does not exist' });
    }

    next();
}
/** END OF Middleware */

/** Routes */
/** Route GET /all */
router.get('/', async (req, res, next) => {
    // const { cartID } = req.query;

    try {
        const cart = await Cart.findOne({}).populate('trips').lean();

        if (cart === null) {
            return res.json({ result: false, cart: {} });
        }

       for (const trip of cart.trips) {
            trip.hours = getHoursFromDate(trip.date);
        }

        return res.json({ result: true, cart: cart });
    } catch (e) {
        console.error('Error With Route GET /carts =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route GET /all */


/** Route POST /save */
router.post('/save', isTripValid, async (req, res, next) => {
    const {tripID} = req.body;
    try {
        const cart = await Cart.findOneAndUpdate(
            {},
            { $addToSet: { trips: tripID } },
            { upsert: true, new: true }
        );

        return res.json({ result: true, cartID: cart._id});
    } catch (e) {
        console.error('Error With Route POST /carts/save =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route POST /save */




/** Route DELETE /delete/:cartID */
router.delete('/delete/:tripID', isCartExists, async (req, res, next) => {
    const { tripID } = req.params;

    try {
        const updatedCart = await Cart.findOneAndUpdate(
            {},
            { $pull: { trips: tripID } },
            { new: true } 
        );

        if (updatedCart.trips.length === 0) {
            await updatedCart.deleteOne();
            return res.json({ result: true, message: 'Cart deleted because it is empty' });
        }

        return res.json({ result: true, message: 'Cart deleted' });
    } catch (e) {
        console.error('Error With Route DELETE /carts/delete/:cartID =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route POST /delete/:cartID */
/** END OF Routes */


module.exports = router;