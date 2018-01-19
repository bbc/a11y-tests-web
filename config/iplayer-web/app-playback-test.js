'use strict';

const { options: commonOptions } = require('./common');

const commonSkips = commonOptions.skip;
const playbackSpecificSkips = ['Headings: Content must follow headings'];

const options = Object.assign({}, commonOptions,
  {skip: commonSkips.concat(playbackSpecificSkips)
  });

module.exports = {
  options,
  baseUrl: 'https://frontdoor.iplayer.test.api.bbc.co.uk',
  paths: [
    '/iplayer/episode/p04qh1gk/face-to-face-dame-edith-sitwell'
  ]
};
