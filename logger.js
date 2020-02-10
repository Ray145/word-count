'use strict';

const log4js = require('log4js');

let _LOGGER;

module.exports = {
    initialiseLogger,
    getLogger: () => _LOGGER
};

function initialiseLogger(config) {
    if (!_LOGGER) {
        _LOGGER = configureLogger(config);
    }

    return _LOGGER;
}

function configureLogger(config) {

    const { loggerName, logLevel } = config;

    log4js.configure({
        pm2: true,
        pm2InstanceVar: 'WORD-COUNT-API',
        appenders: { console: { type: 'console' } },
        categories: { default: { appenders: ['console'], level: logLevel } }
    });

    return log4js.getLogger(loggerName);
}