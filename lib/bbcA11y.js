'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./colourfulLog');
const {
  getConfigName,
  getConfig,
  getSignedInPaths,
  getSignInCredentials
} = require('./common');

const configFilePath = path.resolve(`${__dirname}/../a11y.js`);

function build() {
  const configName = getConfigName();
  const config = getConfig(configName);
  const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
  const domain = baseUrl.replace(/(https?:\/\/)/, '');
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

  fs.writeFileSync(configFilePath, a11yOutput);

  logger.log(`Tests will run against: ${domain} ${paths.join(' ')}`);
  if (signedInPaths.length) {
    logger.log(`Tests will run signed in against: ${domain} ${signedInPaths.join(' ')}`);
  }
}

function clean() {
  try {
    fs.unlinkSync(configFilePath);
  } catch (e) {
    // Cannot delete file (probably because it does not exist).
  }
}

function pathToOutput(baseUrl, path, options = {}, signedIn) {
  const visitOptions = getVisitOption(baseUrl, path, signedIn, options);

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

function getVisitOption(baseUrl, path, signedIn, options) {
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

  if (options.visit) {
    return `visit: ${options.visit.toString()},`;
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
