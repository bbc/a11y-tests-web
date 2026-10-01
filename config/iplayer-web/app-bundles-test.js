'use strict';

const bundlesSignedIn = require('./app-bundles-test-signed-in');

module.exports = {
  ...bundlesSignedIn,
  paths: [
    '/iplayer'
  ]
};
