const baseUrl = process.env.A11Y_SOUNDS_WEB_BASE_URL || 'https://www.bbc.co.uk';

module.exports = {
  options: {
    hide: ['orb', 'bbccookies-prompt', 'smphtml5iframebbcMediaPlayer', 'smphtml5iframesmp-wrapper', 'edr_l_first', 'bbcprivacy-prompt', 'id4-cta-', 'msi-modal', 'p_audioui_'],
    skip: []
  },
  baseUrl,
  paths: [
    '/sounds',
    '/sounds/play/live:bbc_radio_one',
    '/sounds/play/b06707ks',
    '/sounds/my',
    '/sounds/brand/b006tnxf',
    '/sounds/categories',
    '/sounds/category/comedy?sort=popular'
  ],
  signedInPaths: [
    '/sounds',
    '/sounds/play/live:bbc_radio_one',
    '/sounds/play/b06707ks',
    '/sounds/my',
    '/sounds/brand/b006tnxf',
    '/sounds/categories',
    '/sounds/category/comedy?sort=popular'
  ]
};
