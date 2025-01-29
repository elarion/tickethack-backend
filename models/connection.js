const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING;

async function connectToDatabase() {
    try {
        await mongoose.connect(connectionString);
        console.log('Database connected');
    } catch (e) {
        console.error('Error connecting to the database:', e);
    }
}

module.exports = {connectToDatabase};