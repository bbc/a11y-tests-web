'use strict';

const baseUrl = process.env.A11Y_SOUNDS_WEB_BASE_URL || 'https://www.bbc.co.uk';

const { options } = require('./common');

const listenPage = require('./listen_page');
const playspace = require('./playspace');
const mySounds = require('./my_sounds');
const category = require('./category_pages');

module.exports = {
  options,
  baseUrl,
  paths: [
    ...listenPage.paths,
    ...playspace.paths,
    ...mySounds.paths,
    ...category.paths
  ],
  signedInPaths: [
    ...listenPage.signedInPaths,
    ...playspace.signedInPaths,
    ...mySounds.signedInPaths,
    ...category.signedInPaths
  ]
};
