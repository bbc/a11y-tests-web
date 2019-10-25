const baseUrl = process.env.A11Y_SOUNDS_WEB_BASE_URL || 'https://www.bbc.co.uk';

const { options } = require('./common');

module.exports = {
  options,
  baseUrl,
  paths: [
    '/sounds/play/m0009353',
    '/sounds/play/live:bbc_radio_one'
  ],
  signedInPaths: [
    '/sounds/play/m0009353',
    '/sounds/play/live:bbc_radio_one'
  ]
};
