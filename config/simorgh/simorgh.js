'use strict';

const { options } = require('./common');

const baseUrl = process.env.A11Y_SIMORGH_BASE_URL || 'http://localhost:7080';

module.exports = {
  options,
  baseUrl,
  paths: [
    '/article/scenario-25',
    '/article/scenario-27'
  ]
};
