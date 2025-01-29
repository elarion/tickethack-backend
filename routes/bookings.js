const express = require('express');
const router = express.Router();

const Booking = require('../models/bookings');
const Cart = require('../models/carts');
// const { formatDateForBookings, getHoursFromDate } = require('../modules/helpers');

/** Middleware */
// function isBookingIDFieldExists(req, res, next) {
//     if (!req.query.bookingID) {
//         return res.json({ result: false, message: 'Missing bookingID field in params' });
//     }

//     next();
// }
async function isCartExists(req, res, next) {
    if (!req.body.cartID) {
        return res.json({ result: false, message: 'Missing cartID field in body' });
    }

    const exist = await Cart.exists({ _id: req.body.cartID });

    if (exist === null) {
        return res.json({ result: false, message: 'Cart does not exist -> Booking can not be saved' });
    }

    next();
}
/** END OF Middleware */

/** Routes */
/** Route GET /all */
// router.get('/', isBookingIDFieldExists, async (req, res, next) => {
//     const { bookingID } = req.query;
router.get('/', async (req, res, next) => {
    try {
        const trips = await Booking.aggregate([
            {
                $lookup: {
                    from: 'trips',
                    localField: 'trips',
                    foreignField: '_id',
                    as: 'trips'
                }
            },
            { $unwind: "$trips" }, 
            {
                $set: {
                    "trips.timeDiff": { $divide: [{ $subtract: ["$trips.date", new Date()] }, 3600000] }
                }
            },
            {
                $set: {
                    "trips.timeLeft": {
                        $switch: {
                            branches: [
                                {
                                    case: { $lt: ["$trips.timeDiff", 0] },
                                    then: "Train is gone"
                                },
                                {
                                    case: { $lt: ["$trips.timeDiff", 24] },
                                    then: {
                                        $concat: [
                                            "Départ dans ", { $toString: { $floor: "$trips.timeDiff" } }, " heures"
                                        ]
                                    }
                                }
                            ],
                            default: {
                                $concat: [
                                    "Departure in ", { $toString: { $floor: { $divide: ["$trips.timeDiff", 24] } } }, " days"
                                ]
                            }
                        }
                    },
                    "trips.hours": {
                        $dateToString: { format: "%Hh%M", date: "$trips.date", timezone: "Europe/Paris" }
                    }
                }
            },
            { $replaceRoot: { newRoot: "$trips" } }
        ]);

        return res.json({ result: trips.length > 0, trips });

    } catch (e) {
        console.error('Error With Route GET /bookings =>', e);
        return res.json({ result: false, message: e.message });
    }
});

// router.get('/', async (req, res, next) => {
//     try {
//         const bookings = await Booking.find().populate('trips').lean();

//         for (const booking of bookings) {
//             booking.trips = booking.trips.map(trip => {
//                 trip.timeLeft   = formatDateForBookings(trip.date);
//                 trip.hours      = getHoursFromDate(trip.date);
//                 return trip;
//             });
//         }

//         // console.log(bookings);

//         return res.json({ result: bookings.length > 0, bookings: bookings });
//     } catch (e) {
//         console.error('Error With Route GET /bookings =>', e);
//         return res.json({ result: false, message: e.message });
//     }
// });
/** END OF Route GET /all */


/** Route POST /save */
router.post('/save', isCartExists, async (req, res, next) => {
    const { cartID } = req.body;

    try {
        const cart = await Cart.findById(cartID);

        const newBooking = new Booking({
            trips: cart.trips.map(trip => trip._id)
        });

        await newBooking.save();
        await cart.deleteOne();

        // return res.redirect('./booking.html');
        return res.json({ result: true, message: 'Booking saved' });
    } catch (e) {
        console.error('Error With Route POST bookings/save =>', e);
        return res.json({ result: false, message: e.message });
    }
});
/** END OF Route POST /save */
/** END OF Routes */

module.exports = router;