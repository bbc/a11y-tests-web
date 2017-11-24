const fs = require('fs');
const path = require('path');
const logger = require('./lib/colourfulLog');

const configName = getConfigName();
const config = getConfig(configName);
const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
const paths = config.paths || [];
const signedInPaths = getSignedInPaths();
const signedOutOutput = pathsToOutput(baseUrl, paths, config.options);
const signedInOutput = pathsToOutput(baseUrl, signedInPaths, config.options, true);
const a11yOutput = `
  ${signedOutOutput}
  ${signedInOutput}
`;

function pathsToOutput(baseUrl, paths, options, signedIn = false) {
  return paths.reduce(
    (acc, path) => acc + pathToOutput(baseUrl, path, options, signedIn),
    ''
  );
}

function getSignInCredentials() {
  const { A11Y_USERNAME: username, A11Y_PASSWORD: password } = process.env;
  return { username, password };
}

function getSignedInPaths() {
  const paths = config.signedInPaths || [];

  const { username, password } = getSignInCredentials();
  if (paths.length && (!username || !password)) {
    logger.warning('Skipping signed in paths because a username and/or password were not specified. (Use A11Y_USERNAME and A11Y_PASSWORD environment variables to set them)');
    return [];
  }

  return paths;
}

fs.writeFileSync('a11y.js', a11yOutput);

logger.log(`Tests will run against: ${baseUrl.replace(/(https?:\/\/)/, '')} ${paths.join(" ")}`);
logger.log(`Tests will run signed in against: ${baseUrl.replace(/(https?:\/\/)/, '')} ${signedInPaths.join(" ")}`);

function getConfigName() {
  const configName = process.env.BBC_A11Y_CONFIG;

  if (!configName) {
    logger.error('No bbc-a11y config selected. Use the BBC_A11Y_CONFIG environment variable to set one.');
    process.exit(1);
  }

  return configName;
}

function getConfig(configName) {
  try {
    return require(`./config/bbc-a11y/${configName}`);
  } catch (e) {
    logger.error(`Could not find a bbc-a11y config named ${configName}.`);
    process.exit(1);
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
    },`
  }

  return '';
}
