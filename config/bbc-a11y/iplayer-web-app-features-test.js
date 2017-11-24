const { options } = require('./iplayer-web-all');

module.exports = {
  options,
  baseUrl: 'https://frontdoor.iplayer.test.api.bbc.co.uk',
  paths: [
    "/iplayer/features/accessibility",
    "/iplayer/features/downloads",
    "/iplayer/features/downloads-beta",
    "/iplayer/features/iplayer-kids",
    "/iplayer/features/my-programmes",
    "/iplayer/features/sign-in",
    "/iplayer/features/30-days"
  ],
  signedInPaths: [
    "/iplayer/features/sign-in"
  ]
};
