'use strict';

module.exports = {
  baseUrl: 'http://localhost:7080',
  paths: [
    '/news/articles/c0000000025o',
    '/news/articles/c0000000027o'
    //    '/news/articles/c0000000000o'
  ],
  LIGHTHOUSE_OPTS: {
    config: {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['accessibility', 'best-practices']
      },
      categories: {
        accessibility: {
          weight: 1
        }
      }
    },
    flags: {
      logLevel: 'silent',
      output: 'json'
    }
  }
};
