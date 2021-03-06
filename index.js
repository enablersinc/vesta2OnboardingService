const mongoose = require('mongoose');
const util = require('util');

// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');

const debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;
// const port = process.env.PORT || config.port;
mongoose
  .connect(mongoUri, {
    // useMongoClient: true,
    useNewUrlParser: true,
    poolSize: 2,
    promiseLibrary: global.Promise
  })
  .then(() => console.log(`Server connected to: ${mongoUri}`))
  .catch(err => console.error('Could not connect to MongoDB...'));
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  app.set('port', process.env.PORT || config.port);
  // listen on port config.port
  app.listen(app.get('port'), () => {
    console.info(`server started on port ${app.get('port')} (${config.env})`); // eslint-disable-line no-console
  });
}

module.exports = app;
