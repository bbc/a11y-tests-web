'use strict';

const logger = require('./colourfulLog');

function getConfigName() {
  const configName = process.env.ATW_CONFIG;

  if (!configName) {
    logger.error('No config selected. Use the ATW_CONFIG environment variable to set one.');
    process.exit(1);
  }

  return configName;
}

function getConfig(configName) {
  try {
    return require(`../config/${configName}`);
  } catch (e) {
    logger.error(`Could not find a valid config named ${configName}`);
    process.exit(1);
  }

  return {};
}

function getSignInCredentials() {
  const { ATW_USERNAME: username, ATW_PASSWORD: password } = process.env;
  return { username, password };
}

function getSignedInPaths(config) {
  const paths = config.signedInPaths || [];

  const { username, password } = getSignInCredentials();
  if (paths.length && (!username || !password)) {
    logger.warning('Skipping signed in paths because a username and/or password were not specified. (Use ATW_USERNAME and ATW_PASSWORD environment variables to set them)');
    return [];
  }

  return paths;
}

module.exports = {
  getConfigName,
  getConfig,
  getSignedInPaths,
  getSignInCredentials
};
