'use strict';

const logger = require('./colourfulLog');

function getConfigName() {
  const configName = process.env.A11Y_CONFIG;

  if (!configName) {
    logger.error('No config selected. Use the A11Y_CONFIG environment variable to set one.');
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

function getOutputJson() {
  const outputJsonPath = process.env.OUTPUT_JSON;

  if (!outputJsonPath) {
    logger.log('No JSON output path provided. Use the OUTPUT_JSON environment variable to set one.');
    return '/../lighthouse-report.json';
  }

  return outputJsonPath;

}

function getSignInCredentials() {
  const { A11Y_USERNAME: username, A11Y_PASSWORD: password } = process.env;
  return { username, password };
}

function getSignedInPaths(config) {
  const paths = config.signedInPaths || [];

  const { username, password } = getSignInCredentials();
  if (paths.length && (!username || !password)) {
    logger.warning('Skipping signed in paths because a username and/or password were not specified. (Use A11Y_USERNAME and A11Y_PASSWORD environment variables to set them)');
    return [];
  }

  return paths;
}

module.exports = {
  getConfigName,
  getConfig,
  getOutputJson,
  getSignedInPaths,
  getSignInCredentials
};
