'use strict';

const { options } = require('./common');

module.exports = {
  options,
  baseUrl: process.env.URL,
  paths: ['']
};

// can be used to test single url passed in:
// URL='http://www.google.com' A11Y_CONFIG=sounds-web/url a11y-tests-web bbc-a11y -m headless
