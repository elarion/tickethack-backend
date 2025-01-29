const moment = require('moment');

// Get hours from date using moment.js
function getHoursFromDate(date) {
    // Get the current date as a moment object
    const now = moment();
    // Get the date from the parameter and convert it to a moment object
    date = moment(date);

    // If the date is the same as the current date, return the hours and minutes else return the full date
    return date.isSame(now, 'day') ? moment(date).format('HH:mm') : date.format('MM/DD/YYYY HH[h]mm');
}

function formatDateForSearch(date) {
    return [
        moment(date, 'YYYY-MM-DD').format(),
        moment(date, 'YYYY-MM-DD').endOf('day').format()
    ];
}

function formatDateForBookings(date) {
    const now = moment();
    date = moment(date);

    return date.isAfter(now) ? `Departure in ${date.fromNow(true)}` : `Train is gone`;
}

module.exports = { getHoursFromDate, formatDateForSearch, formatDateForBookings }