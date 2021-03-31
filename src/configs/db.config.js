require('dotenv').config();

const MONGO_DB_HOST = process.env.MONGO_DB_HOST || 'localhost';
const MONGO_DB_PORT = process.env.MONGO_DB_PORT || 27017;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'Blog';
const REDIS_DB_HOST = process.env.REDIS_DB_HOST || 'localhost';
const REDIS_DB_PORT = process.env.REDIS_DB_PORT || 6379;

module.exports = {
    MONGO_URI: `mongodb://${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_NAME}`,
    REDIS_URI: `redis://${REDIS_DB_HOST}:${REDIS_DB_PORT}`
};