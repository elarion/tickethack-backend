const express = require('express');
const router = express.Router();

const Trip = require('../models/trips');

const { getHoursFromDate, formatDateForSearch } = require('../modules/helpers');

const validateSearchFields = (req, res, next) => {
    const requiredFields = ['arrival', 'departure', 'date'];
    const errors = [];

    requiredFields.forEach(field => {
        if (!req.body[field]) {
            errors.push({[field] : `The field ${field} is required in body.`});
        }
    });

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

router.post('/search', validateSearchFields,  async (req, res, next) => {
    const { arrival, departure, date } = req.body;
    const dateRange = formatDateForSearch(date);

    try {
        const trips = await Trip.find({
            departure: { '$regex': arrival, $options: 'i' },
            arrival:  { '$regex': departure, $options: 'i' },
            arrival: arrival,
            departure: departure,
            date: {
                $gte: dateRange[0],
                $lte: dateRange[1]
            }
        });

        return res.json({ result: true, trips: trips });
    } catch (e) {
        console.error('Error With Route POST trips/search =>', e);
        return res.json({ result: false, message: e.message });
    }
});

module.exports = router;