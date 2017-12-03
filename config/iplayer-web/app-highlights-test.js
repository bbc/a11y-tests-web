'use strict';

const { options } = require('./common');

module.exports = {
  options,
  baseUrl: 'https://frontdoor.iplayer.test.api.bbc.co.uk',
  paths: [
    '/bbcone',
    '/bbctwo',
    '/tv/bbcthree',
    '/bbcfour',
    '/tv/radio1',
    '/tv/cbbc',
    '/tv/cbeebies',
    '/tv/bbcnews',
    '/tv/bbcparliament',
    '/tv/bbcalba',
    '/tv/s4c'
  ]
};
