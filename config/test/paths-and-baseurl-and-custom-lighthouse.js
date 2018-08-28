'use strict';

module.exports = {
  baseUrl: 'http://base.url',
  paths: [
    '/path/1'
  ],
  LIGHTHOUSE_OPTS: {
    config: {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['accessibility', 'seo', 'pwa', 'best-practices', 'performance']
      },
      categories: {
        accessibility: {
          weight: 1
        }
      }
    },
    flags: {
      logLevel: 'silent',
      output: 'json',
      port: 1234
    }
  }
};
