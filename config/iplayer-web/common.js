'use strict';

const baseUrl = process.env.A11Y_IPLAYER_WEB_BASE_URL || 'https://sandbox.bbc.co.uk';

// Skipped tests are those for which we have tickets prioritised in the backlog to fix

module.exports = {
  options: {
    hide: [
      'orb',
      'bbccookies-prompt',
      'smphtml5iframebbcMediaPlayer',
      'edr_l_first',
      'edr_lwrap_first'
    ],
    skip: [
      'Text equivalents: Visual formatting: Use tables for data',
      'Design: Content resizing: Text must be styled with units that are resizable in all browsers'
    ]
  },
  baseUrl
};
