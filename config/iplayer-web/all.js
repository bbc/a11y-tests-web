'use strict';

const features = require('./app-features-test');
const highlights = require('./app-highlights-test');
const homepage = require('./app-homepage-test');
const lists = require('./app-lists-test');
const myprogrammes = require('./app-myprogrammes-test');
const playback = require('./app-playback-test');
const { options, baseUrl } = require('./common');

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
    '/iplayer/categories/arts/highlights',
    '/iplayer/categories/arts/all?sort=atoz',
    '/iplayer/categories/arts/all?sort=dateavailable',
    '/iplayer/categories/drama-sci-fi-and-fantasy/highlights',
    '/iplayer/categories/drama-sci-fi-and-fantasy/all?sort=atoz',
    '/iplayer/categories/drama-sci-fi-and-fantasy/all?sort=dateavailable',
    '/iplayer/a-z/a',
    '/iplayer/guide',
    '/iplayer/watching',
    '/iplayer/added',
    '/bbcfour/collections',
    '/tv'
  ],
  signedInPaths: [
    ...features.signedInPaths,
    ...homepage.signedInPaths,
    ...myprogrammes.signedInPaths,
    '/iplayer/watching',
    '/iplayer/added'
  ]
};
