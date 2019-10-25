const baseUrl = process.env.A11Y_SOUNDS_WEB_BASE_URL || 'https://www.bbc.co.uk';

const { options } = require('./common');

const listen_page = require('./listen_page');
const playspace = require('./playspace');
const my_sounds = require('./my_sounds');
const category = require('./category_pages');

module.exports = {
  options,
  baseUrl,
  paths: [
    ...listen_page.paths,
    ...playspace.paths,
    ...my_sounds.paths,
    ...category.paths
  ],
  signedInPaths: [
    ...listen_page.signedInPaths,
    ...playspace.signedInPaths,
    ...my_sounds.signedInPaths,
    ...category.signedInPaths
  ]
};
