'use strict';

const { options } = require('./common');

module.exports = {
  options,
  baseUrl: process.env.A11Y_SOUNDS_WEB_BASE_URL,
  paths: [A11Y_SOUNDS_WEB_PATH]
};

// can be used to test single url passed in:
// URL='http://www.google.com' A11Y_CONFIG=sounds-web/url a11y-tests-web bbc-a11y -m headless
