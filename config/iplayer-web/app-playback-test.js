'use strict';

const { options: commonOptions, baseUrl } = require('./common');

const commonSkips = commonOptions.skip;

// Following is awaiting this being fixed: https://github.com/bbc/bbc-a11y/issues/238
const playbackSpecificSkips = ['Structure: Headings: Content must follow headings'];

const options = Object.assign({}, commonOptions,
  {
    skip: [...commonSkips, ...playbackSpecificSkips]
  }
);

module.exports = {
  options,
  baseUrl,
  paths: [
    '/iplayer/episode/p04qj936/face-to-face-adam-faith'
  ]
};
