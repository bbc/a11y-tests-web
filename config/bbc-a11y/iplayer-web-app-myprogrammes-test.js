const { options } = require('./iplayer-web-all');

module.exports = {
  options,
  baseUrl: 'https://frontdoor.iplayer.test.api.bbc.co.uk',
  paths: [
    "/iplayer/recommendations"
  ],
  signedInPaths: [
    "/iplayer/recommendations"
  ]
};
