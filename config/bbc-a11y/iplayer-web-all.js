const features = require('./iplayer-web-app-features-test');
const highlights = require('./iplayer-web-app-highlights-test');
const homepage = require('./iplayer-web-app-homepage-test');
const lists = require('./iplayer-web-app-lists-test');
const myprogrammes = require('./iplayer-web-app-myprogrammes-test');
const playback = require('./iplayer-web-app-playback-test');
const { options } = require('./iplayer-web-common');

module.exports = {
  options,
  baseUrl: "https://www.bbc.co.uk",
  paths: [
    ...features.paths,
    ...highlights.paths,
    ...homepage.paths,
    ...lists.paths,
    ...myprogrammes.paths,
    ...playback.paths,
    "/iplayer/categories/arts/highlights",
    "/iplayer/categories/arts/all?sort=atoz",
    "/iplayer/categories/arts/all?sort=dateavailable",
    "/iplayer/categories/drama-sci-fi-and-fantasy/highlights",
    "/iplayer/categories/drama-sci-fi-and-fantasy/all?sort=atoz",
    "/iplayer/categories/drama-sci-fi-and-fantasy/all?sort=dateavailable",
    "/iplayer/a-z/a",
    "/iplayer/guide",
    "/iplayer/watching",
    "/iplayer/added",
    "/bbcfour/collections",
    "/tv"
  ],
  signedInPaths: [
    ...features.signedInPaths,
    ...homepage.signedInPaths,
    ...myprogrammes.signedInPaths,
    "/iplayer/watching",
    "/iplayer/added"
  ]
};
