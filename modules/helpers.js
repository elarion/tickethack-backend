const moment = require('moment');

function getHoursFromDate(date) {
    return moment(date).format('HH:mm');
}

function formatDateForSearch(date) {
    return [
        moment(date, 'DD/MM/YYYY').format(),
        moment(date, 'DD/MM/YYYY').endOf('day').format()
    ];
}

module.exports = { getHoursFromDate, formatDateForSearch }