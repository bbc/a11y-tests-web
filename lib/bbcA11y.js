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
    logger.log('Error cleaning but this should be OK', e);
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
      function navigateToUrl(url) {
        return new Promise(function (resolve) {
          frame.onload = function () { frame.onload = null; resolve(); };
          frame.src = url;
        });
      }

      function waitForElementById(id) {
        return new Promise(function (resolve, reject) {
          var start = Date.now();
          (function poll() {
            var doc = frame.contentDocument;
            var el = doc && doc.getElementById(id);
            if (el) { resolve(el); return; }
            if (Date.now() - start > 15000) {
              console.log('Timed out. Current document:', doc);
              var href = doc ? doc.location.href : '(no document)';
              reject(new Error('Timed out waiting for #' + id + ' at ' + href));
              return;
            }
            setTimeout(poll, 100);
          })();
        });
      }

      function typeIntoElement(el, value) {
        el.focus();
        frame.contentDocument.execCommand('insertText', false, value);
      }

      return navigateToUrl('https://www.bbc.co.uk').then(function () {
        return navigateToUrl('https://account.bbc.com/auth?ptrt=${encodedUrl}');
      }).then(function () {
        return waitForElementById('username');
      }).then(function (user) {
        typeIntoElement(user, '${username}');
        frame.contentDocument.getElementById('submit-button').click();
        return waitForElementById('password');
      }).then(function (pass) {
        typeIntoElement(pass, '${password}');
        return new Promise(function (resolve) {
          frame.onload = resolve;
          frame.contentDocument.getElementById('submit-button').click();
        });
      });
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
