const { connectToDatabase } = require('./models/connection'); 
connectToDatabase();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    res.status(503).json({
        result: false,
        message: 'Database not connected.',
    });
});


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tripsRouter = require('./routes/trips');
const cartsRouter = require('./routes/carts');
const bookingsRouter = require('./routes/bookings');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/trips', tripsRouter);
app.use('/carts', cartsRouter);
app.use('/bookings', bookingsRouter);

module.exports = app;