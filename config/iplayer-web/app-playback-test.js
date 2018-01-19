'use strict';

const { options: commonOptions } = require('./common');

const commonSkips = commonOptions.skip;
const playbackSpecificHides = ['carousel-outer-outer'];

const commonHides = commonOptions.hide;
const playbackSpecificSkips = ['Headings: Content must follow headings'];

const options = Object.assign({}, commonOptions,
  {
    skip: [...commonSkips, ...playbackSpecificSkips],
    hide: [...commonHides, ...playbackSpecificHides]
  }
);

module.exports = {
  options,
  baseUrl: 'https://frontdoor.iplayer.test.api.bbc.co.uk',
  paths: [
    '/iplayer/episode/p04qh1gk/face-to-face-dame-edith-sitwell'
  ]
};
