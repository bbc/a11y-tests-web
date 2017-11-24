module.exports = {
  options: {
    hide: ['orb', 'bbccookies-prompt', '/html/head/iframe', 'smphtml5iframebbcMediaPlayer', "tvip-channels-stream-inner"],
    skip: [
      'Title attributes: Title attributes only on inputs',
      'Tables: Use tables for data'
    ]
  },
  baseUrl: 'https://www.bbc.co.uk',
  paths: [
    "/iplayer"
  ]
};
