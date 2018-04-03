'use strict';

const baseUrl = process.env.A11Y_IPLAYER_WEB_BASE_URL || 'https://www.bbc.co.uk';

module.exports = {
  options: {
    hide: ['orb', 'bbccookies-prompt', '/html/head/iframe', 'smphtml5iframebbcMediaPlayer', 'tvip-channels-stream-inner'],
    skip: [
      'Title attributes: Title attributes only on inputs',
      'Tables: Use tables for data'
    ]
  },
  baseUrl
};
