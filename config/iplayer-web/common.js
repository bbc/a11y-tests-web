'use strict';

const baseUrl = process.env.A11Y_IPLAYER_WEB_BASE_URL || 'https://www.bbc.co.uk';

// Skipped tests are those for which we have tickets prioritised in the backlog to fix

module.exports = {
  options: {
    hide: ['orb', 'bbccookies-prompt', '/html/head/iframe', 'smphtml5iframebbcMediaPlayer', 'tvip-channels-stream-inner'],
    skip: [
      'Title attributes: Title attributes only on inputs',
      'Tables: Use tables for data',
      'Resizable text: Text must be styled with units that are resizable in all browsers'
    ]
  },
  baseUrl
};
