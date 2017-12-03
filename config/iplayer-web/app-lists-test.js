'use strict';

const { options } = require('./common');

module.exports = {
  options,
  baseUrl: 'https://frontdoor.iplayer.test.api.bbc.co.uk',
  paths: [
    '/bbcone/a-z',
    '/iplayer/most-popular'
  ]
};
