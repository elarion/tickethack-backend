// Initialize express router
const express = require('express');
const router = express.Router();

// Import Trip model
const Trip = require('../models/trips');

// Import helper functions
const { getHoursFromDate, formatDateForSearch } = require('../modules/helpers');

// Validate search fields middleware
const validateSearchFields = (req, res, next) => {
    // Required fields
    const requiredFields = ['arrival', 'departure', 'date'];
    const errors = [];

    // Loop through required fields
    requiredFields.forEach(field => {
        // If the field is not in the request body, add an error message
        if (!req.body[field]) {
            errors.push({[field] : `The field ${field} is required in body.`});
        }
    });

    // If errors array is not empty, return the errors
    if (errors.length > 0) {
        return res.status(400).json({ success: false, messages : errors });
    }

    next();
};


router.get('/all', async (req, res, next) => {
    try {
        const trips = await Trip.find();

        return res.json({ result: true, trips: trips });
    } catch (e) {
        console.error('Error With Route GET trips/all =>', e);
        return res.json({ result: false, message: e.message });
    }
});

// Route POST trips/search
router.post('/search', validateSearchFields,  async (req, res, next) => {
    // Get search fields from request body
    const { arrival, departure, date } = req.body;
    // Format date for search
    const dateRange = formatDateForSearch(date);

    try {
        // Find trips with search fields
        let trips = await Trip.find({
            departure: { '$regex': departure, $options: 'i' },
            arrival:  { '$regex': arrival, $options: 'i' },
            // Filter by date
            date: {
                // Greater than or equal to the start of the day
                $gte: dateRange[0],
                // Less than or equal to the end of the day
                $lte: dateRange[1]
            }
        }).lean();

        for (const trip of trips) {
            // Transform date to hours of the date
            trip.hours = getHoursFromDate(trip.date);
        }

        return res.json({ result: trips.length > 0, trips: trips });
    } catch (e) {
        // If an error occurs, return the error message
        console.error('Error With Route POST trips/search =>', e);
        return res.json({ result: false, message: e.message });
    }
});

module.exports = router;