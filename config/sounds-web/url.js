'use strict';

const { options } = require('./common');

module.exports = {
  options,
  baseUrl: process.env.A11Y_URL,
  paths: []
};

// can be used to test single url passed in:
// A11Y_URL='http://www.google.com' A11Y_CONFIG=sounds-web/url a11y-tests-web bbc-a11y -m headless
