const moment = require('moment');

function getHoursFromDate(date) {
    return moment(date).format('HH:mm');
}

function formatDateForSearch(date) {
    return [
        moment(date, 'YYYY-MM-DD').format(),
        moment(date, 'YYYY-MM-DD').endOf('day').format()
    ];
}

module.exports = { getHoursFromDate, formatDateForSearch }