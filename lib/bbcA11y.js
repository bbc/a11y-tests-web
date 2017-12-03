'use strict';

const fs = require('fs');
const logger = require('./colourfulLog');
const {
  getConfigName,
  getConfig,
  getSignedInPaths,
  getSignInCredentials
} = require('./common');

function build() {
  const configName = getConfigName();
  const config = getConfig(configName);
  const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
  const paths = config.paths || [];
  const signedInPaths = getSignedInPaths(config);

  if (!paths.length && !signedInPaths.length) {
    logger.error(`No paths listed in the config for ${configName}`);
    process.exit(1);
  }

  const signedOutOutput = pathsToOutput(baseUrl, paths, config.options);
  const signedInOutput = pathsToOutput(baseUrl, signedInPaths, config.options, true);
  const a11yOutput = `
    ${signedOutOutput}
    ${signedInOutput}
  `;

  fs.writeFileSync('a11y.js', a11yOutput);

  logger.log(`Tests will run against: ${baseUrl.replace(/(https?:\/\/)/, '')} ${paths.join(' ')}`);
  logger.log(`Tests will run signed in against: ${baseUrl.replace(/(https?:\/\/)/, '')} ${signedInPaths.join(' ')}`);
}

function clean() {
  try {
    fs.unlinkSync('a11y.js');
  } catch (e) {
    // Cannot delete file (probably because it does not exist).
  }
}

function pathToOutput(baseUrl, path, options = {}, signedIn) {
  const visitOptions = getVisitOption(baseUrl, path, signedIn);

  return `
    page(
      "${baseUrl}${path}",
      {
        ${visitOptions}
        ${JSON.stringify(options).slice(1, -1)}
      }
    )
  `;
}

function getVisitOption(baseUrl, path, signedIn) {
  if (signedIn) {
    const { username, password } = getSignInCredentials();
    const url = baseUrl + path;
    const encodedUrl = encodeURIComponent(url);

    return `visit: function (frame) {
      frame.src = 'https://account.bbc.com/signin?ptrt=${encodedUrl}';
      return new Promise(function (test) {
        frame.onload = function () {
          var loginPage = frame.contentDocument;
          loginPage.getElementById('user-identifier-input').value = '${username}';
          loginPage.getElementById('password-input').value = '${password}';
          loginPage.getElementById('submit-button').click();
          frame.onload = test
        }
      })
    },`;
  }

  return '';
}

function pathsToOutput(baseUrl, paths, options, signedIn = false) {
  return paths.reduce(
    (acc, path) => acc + pathToOutput(baseUrl, path, options, signedIn),
    ''
  );
}

module.exports = {
  build,
  clean
};
