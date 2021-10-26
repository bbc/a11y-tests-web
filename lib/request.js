'use strict';

const http = require('http');

function get(url = '') {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { get };
