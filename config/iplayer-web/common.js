'use strict';

const baseUrl = process.env.A11Y_IPLAYER_WEB_BASE_URL || 'https://test.bbc.co.uk';

// Skipped tests are those for which we have tickets prioritised in the backlog to fix

module.exports = {
  options: {
    hide: ['orb', 'bbccookies-prompt', '/html/head/iframe', 'smphtml5iframebbcMediaPlayer', 'tvip-channels-stream-inner'],
    skip: [
      'Text equivalents: Tooltips and supplementary information: Title attributes only on inputs',
      'Text equivalents: Visual formatting: Use tables for data',
      'Design: Content resizing: Text must be styled with units that are resizable in all browsers'
    ]
  },
  baseUrl
};
