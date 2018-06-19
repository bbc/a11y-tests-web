'use strict';

module.exports = {
  baseUrl: 'http://base.url',
  paths: [
    '/path/1',
    '/path/2'
  ],
  options: {
    some: 'option',
    visit: function () {
      /* Do something */
    }
  }
};
