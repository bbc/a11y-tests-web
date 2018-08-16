'use strict';

const baseUrl = process.env.A11Y_SIMORGH_BASE_URL || 'http://localhost:7080/article/scenario-25';

// Skipped tests are those for which we have tickets prioritised in the backlog to fix

module.exports = {
  options: {},
  baseUrl
};
