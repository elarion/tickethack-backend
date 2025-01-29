const moment = require('moment');

function getHoursFromDate(date) {
    const now = moment();
    date = moment(date);

    return date.isSame(now, 'day') ? moment(date).format('HH:mm') : date.format('DD MMMM YYYY HH[h]mm');
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