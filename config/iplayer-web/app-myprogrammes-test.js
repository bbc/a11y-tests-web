'use strict';

const { options, baseUrl } = require('./common');

module.exports = {
  options,
  baseUrl,
  paths: [
    '/iplayer/recommendations',
    '/iplayer/watchlist',
    '/iplayer/continue-watching'
  ],
  signedInPaths: [
    '/iplayer/recommendations',
    '/iplayer/watchlist',
    '/iplayer/continue-watching'
  ]
};
