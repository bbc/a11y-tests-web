'use strict';

const { options, baseUrl } = require('./common');

module.exports = {
  options,
  baseUrl,
  paths: [
    '/iplayer/added',
    '/iplayer/recommendations',
    '/iplayer/watching',
    '/iplayer/watchlist',
    '/iplayer/continue-watching'
  ],
  signedInPaths: [
    '/iplayer/added',
    '/iplayer/recommendations',
    '/iplayer/watching',
    '/iplayer/watchlist',
    '/iplayer/continue-watching'
  ]
};
