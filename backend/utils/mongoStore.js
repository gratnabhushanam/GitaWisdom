const mongoose = require('mongoose');

const isMongoEnabled = String(process.env.USE_MONGODB || 'false').toLowerCase() === 'true';
const isMongoConnected = () => mongoose.connection && mongoose.connection.readyState === 1;
const useMongoStore = () => isMongoEnabled && isMongoConnected();

module.exports = { isMongoEnabled, isMongoConnected, useMongoStore };
