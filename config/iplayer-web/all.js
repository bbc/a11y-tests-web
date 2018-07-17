'use strict';

const features = require('./app-features-test');
const highlights = require('./app-highlights-test');
const homepage = require('./app-homepage-test');
const lists = require('./app-lists-test');
const myprogrammes = require('./app-myprogrammes-test');
const playback = require('./app-playback-test');
const guide = require('./app-guide-test');
const { options } = require('./common');

const baseUrl = process.env.A11Y_IPLAYER_WEB_BASE_URL || 'https://www.bbc.co.uk';

module.exports = {
  options,
  baseUrl,
  paths: [
    ...features.paths,
    ...highlights.paths,
    ...homepage.paths,
    ...lists.paths,
    ...myprogrammes.paths,
    ...playback.paths,
    ...guide.paths,
    '/iplayer/a-z/a',
    '/iplayer/watching',
    '/iplayer/added',
    '/bbcfour/collections'
  ],
  signedInPaths: [
    ...features.signedInPaths,
    ...homepage.signedInPaths,
    ...myprogrammes.signedInPaths,
    '/iplayer/watching',
    '/iplayer/added'
  ]
};
