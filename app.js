'use strict';

const config = require('config');

const express = require('express');
const bodyParser = require('body-parser');

const SwaggerNodeRunner = require('swagger-node-runner');
const SwaggerUI = require('swagger-ui-express');
const RefParser = require('json-schema-ref-parser');

const log4js = require('log4js');

const app = express();


(async function initialise() {

    const logger = require('./logger').initialiseLogger({
        loggerName: 'word-count-api',
        logLevel: config.get('app.logLevel')
    });

    const schema = await RefParser.dereference('./api/swagger/swagger.json');
    const swaggerExpressMiddleware = await setupSwagger(schema);

    app.use(log4js.connectLogger(logger, { level: 'auto', format: '":method :url HTTP/:http-version" - :status - :content-length ":referrer" ":user-agent"' }));
    app.use(bodyParser.json());

    app.use('/docs', SwaggerUI.serve, SwaggerUI.setup(schema));
    swaggerExpressMiddleware.register(app);

    app.listen(config.get('app.port'));
    logger.info(`Listening on port ${config.get('app.port')}`);

    require('./api/models');
})().catch(console.error);


function setupSwagger(schema) {
    const config = {
        swaggerFile: schema,
        appRoot: __dirname
    };

    return new Promise((resolve, reject) => {
        SwaggerNodeRunner.create(config, (err, runner) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(runner.expressMiddleware());
            }
        });
    });
}