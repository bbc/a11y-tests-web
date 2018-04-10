'use strict';

const { options, baseUrl } = require('./common');

module.exports = {
  options,
  baseUrl,
  paths: [
    '/iplayer/features/accessibility',
    '/iplayer/features/downloads',
    '/iplayer/features/iplayer-kids',
    '/iplayer/features/my-programmes',
    '/iplayer/features/sign-in',
    '/iplayer/features/30-days'
  ],
  signedInPaths: [
    '/iplayer/features/sign-in'
  ]
};
