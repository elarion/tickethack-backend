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
// Middleware to check if the cart exists && if the cartID field exists in the request body
async function isCartExists(req, res, next) {
    // If the cartID field does not exist in the request body, return an error message
    if (!req.body.cartID) {
        return res.json({ result: false, message: 'Missing cartID field in body' });
    }

    // Find the cart with the cartID using the exists method to check if the cart exists
    const exist = await Cart.exists({ _id: req.body.cartID });

    // If the cart does not exist, return an error message
    if (exist === null) {
        return res.json({ result: false, message: 'Cart does not exist -> Booking can not be saved' });
    }

    next();
}
/** END OF Middleware */

/** Routes */
/** Route GET /all */
// router.get('/', isBookingIDFieldExists, async (req, res, next) => {
router.get('/', async (req, res, next) => {
    try {
        // Using aggregate to get the trips with the booking details
        // Aggragate is a pipeline that allows you to combine multiple stages to process the data
        // They execute in order, and the output of one stage is the input of the next stage
        const trips = await Booking.aggregate([
            // $lookup to get the trips details (same as populate but for aggregate)
            {
                $lookup: {
                    // From the trips collection
                    from: 'trips',
                    // Local field is the trips field in the booking collection
                    localField: 'trips',
                    // Foreign field is the _id field in the trips collection
                    foreignField: '_id',
                    // As trips in the output
                    as: 'trips'
                }
            },
            // Unwind is used to deconstruct the trips array field from the previous stage
            // To get a flat array of all trips documents
            { $unwind: "$trips" },
            {
                // Set is used to add new fields to the document
                $set: {
                    // timeDiff is the difference between the date field and the current date
                    // I divide the result by 3600000 to get the difference in hours
                    "trips.timeDiff": { $divide: [{ $subtract: ["$trips.date", new Date()] }, 3600000] }
                }
            },
            {
                // Set is used to add the timeLeft field to the document
                $set: {
                    "trips.timeLeft": {
                        // Switch is a conditional operator that returns the first case that matches
                        $switch: {
                            // branches is an array of cases
                            branches: [
                                {
                                    // Case 1 : If the timeDiff is less than 0, return "Train is gone"
                                    // $lt is a comparison operator that returns true if the first value is less than the second value
                                    case: { $lt: ["$trips.timeDiff", 0] },
                                    then: "Train is gone"
                                },
                                {
                                    // Case 2 : If the timeDiff is less than 24, return "Departure in x hours"
                                    case: { $lt: ["$trips.timeDiff", 24] },
                                    then: {
                                        $concat: [
                                            "Departure in ", { $toString: { $floor: "$trips.timeDiff" } }, " hours"
                                        ]
                                    }
                                }
                            ],
                            // Case by default : Return "Departure in x days"
                            default: {
                                // $concat is used to concatenate strings and return the result
                                // I devide the timeDiff by 24 to get the difference in days then i floor the result and convert it to string
                                $concat: [
                                    "Departure in ", { $toString: { $floor: { $divide: ["$trips.timeDiff", 24] } } }, " days"
                                ]
                            }
                        }
                    },
                    // Format the date to HH:MM
                    "trips.hours": {
                        $cond: {
                            if: {
                                $or: [
                                    { $lt: ["$trips.timeDiff", 0] },
                                    { $gte: ["$trips.timeDiff", 24] }
                                ]
                            },

                            then: { $dateToString: { format: "%m/%d/%Y %Hh%M", date: "$trips.date", timezone: "Europe/Paris" } },
                            else: { $dateToString: { format: "%Hh%M", date: "$trips.date", timezone: "Europe/Paris" } }
                        },
                    },
                }
            },
            // $replaceRoot is used to replace the root document with the trips document to avoid nested documents
            { $replaceRoot: { newRoot: "$trips" } }
        ]);

        return res.json({ result: trips.length > 0, trips });

    } catch (e) {
        console.error('Error With Route GET /bookings =>', e);
        return res.json({ result: false, message: e.message });
    }
});


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