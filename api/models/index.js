'use strict';

const mongoose = require('mongoose');

const config = require('config');
const mongoConnString = config.get('mongo.connString');

const logger = require('../../logger').getLogger();


(async function initialise() {

    let mongooseClient;
    try {
        logger.info(`Initialising mongoose connection to ${mongoConnString}`);
        mongooseClient = await mongoose.connect(mongoConnString, { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info(`Finished initialising mongoose connection to ${mongoConnString}`);
    } catch (err) {
        logger.error(`Error while initialising the mongoose connection to ${mongoConnString}; with message: ${err.message}`);
        logger.error(err.stack);

        throw new Error(err);
    }

    mongoose.connection.on('error', err => {
        logger.error(`Mongoose connection error with message: ${err.message}`);
        logger.error(err.stack);
    });

    module.exports = {
        WordCount: mongooseClient.model('word_count', require('./WordCount'))
    };

})().catch(logger.error);