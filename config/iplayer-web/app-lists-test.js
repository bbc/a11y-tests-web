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
  paths: [
    '/bbcone/a-z',
    '/iplayer/most-popular',
    '/iplayer/categories/arts/featured',
    '/iplayer/categories/arts/a-z',
    '/iplayer/categories/arts/most-recent',
    '/iplayer/search?q=east',
    '/iplayer/episodes/b006m86d'
  ]
};
