'use strict';

const { options: commonOptions, baseUrl } = require('./common');

const commonSkips = commonOptions.skip;

const listSpecificSkips = ['Forms: Managing focus: Forms must have submit buttons'];

const options = Object.assign({}, commonOptions,
  {
    skip: [...commonSkips, ...listSpecificSkips]
  }
);

module.exports = {
  options,
  baseUrl,
  signedInPaths: [
    '/iplayer'
  ]
};
