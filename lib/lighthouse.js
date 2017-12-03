'use strict';

const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const lighthouse = require('lighthouse');
const reportBuilder = require('junit-report-builder');

const logger = require('./colourfulLog');
const {
  getConfigName,
  getConfig,
  getSignedInPaths,
  getSignInCredentials
} = require('./common');

const LIGHTHOUSE_OPTS = {
  config: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['accessibility']
    },
    categories: {
      accessibility: {
        weight: 1
      }
    }
  },
  flags: {
    logLevel: 'silent',
    output: 'json'
  }
};

function run() {
  const configName = getConfigName();
  const config = getConfig(configName);
  const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
  const paths = config.paths || [];
  const signedInPaths = getSignedInPaths(config);

  if (!paths.length && !signedInPaths.length) {
    logger.error(`No paths listed in the config for ${configName}`);
    process.exit(1);
  }

  const signedOutTasks = paths.map((path) => () => runTestsForUrl(baseUrl + path, false));
  const signedInTasks = signedInPaths.map((path) => () => runTestsForUrl(baseUrl + path, true));
  const tasks = [...signedOutTasks, ...signedInTasks];

  executeSequentially(tasks)
    .then(() => {
      const output = reportBuilder.build();
      fs.writeFileSync(__dirname + '/../lighthouse-report.xml', output);
      logger.log(output);
    });
}

function runTestsForUrl(url, shouldSignIn) {
  const startTime = new Date();
  logger.log(`Running audit for ${url}`);
  return launchChromeAndRunLighthouse(url, shouldSignIn)
    .then((results) => {
      const suiteName = url.replace(/.*?:\/\//g, '').replace('\/', './');
      const suite = reportBuilder.testSuite().name(suiteName);
      const { audits } = results;

      const endTime = new Date();
      const suiteDuration = (endTime - startTime) / 1000;
      suite.time(suiteDuration);

      const auditKeys = Object.keys(audits);
      const testCaseTime = (suiteDuration / auditKeys.length) / 1000;

      auditKeys.forEach((auditKey) => {
        const { score, description, helpText, details = {}, extendedInfo = {} } = audits[auditKey];
        const testCase = suite.testCase().className(suiteName).name(description).time(testCaseTime);

        if (score !== true && score !== 100) {
          const errorMessage = `Error on ${url}\n${helpText}\n\n`;
          const errorDetail = getErrorDetail({ details, extendedInfo });
          testCase.failure(errorMessage + errorDetail);
        }
      });
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}

function launchChromeAndRunLighthouse(url, shouldSignIn) {
  const { flags: lighthouseFlags, config: lightHouseConfig } = LIGHTHOUSE_OPTS;
  const chromeOpts = getChromeOpts();
  return chromeLauncher.launch(chromeOpts)
    .then((chrome) => {
      return completeSetupSteps(chrome, url, shouldSignIn)
        .then(() => {
          lighthouseFlags.port = chrome.port;
          return lighthouse(url, lighthouseFlags, lightHouseConfig);
        })
        .then((results) => chrome.kill().then(() => results))
        .catch(() => {
          chrome.kill();
        });
    });
}

function getChromeOpts() {
  if (process.env.A11Y_HEADLESS) {
    return {
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    };
  }

  return {
    chromeFlags: ['--disable-gpu', '--no-sandbox']
  };
}

function completeSetupSteps(chrome, url, shouldSignIn) {
  if (shouldSignIn) {
    return signInToBBCID(chrome, url);
  }

  return Promise.resolve();
}

function signInToBBCID(chrome, url) {
  return CDP({ port: chrome.port })
    .then((chromeProtocols) => loadSignInPage(url, chromeProtocols))
    .then(completeSignInProcess);
}

function loadSignInPage(url, { Page, Runtime }) {
  const encodedUrl = encodeURIComponent(url);
  const signInUrl = `https://account.bbc.com/signin?ptrt=${encodedUrl}`;

  return new Promise((resolve) => {
    Page.enable()
      .then(() => Page.navigate({ url: signInUrl }))
      .then(() => {
        Page.loadEventFired(() => resolve({ Page, Runtime }));
      });
  });
}

function completeSignInProcess({ Page, Runtime }) {
  return new Promise((resolve) => {
    const { username, password } = getSignInCredentials();
    const loginScript = `
      document.getElementById('user-identifier-input').value = '${username}';
      document.getElementById('password-input').value = '${password}';
      document.getElementById('submit-button').click();
    `;
    Page.loadEventFired(resolve);
    Runtime.evaluate({ expression: loginScript });
  });
}

function executeSequentially(tasks) {
  if (tasks && tasks.length > 0) {
    const task = tasks.shift();
    return task().then(() => executeSequentially(tasks));
  }

  return Promise.resolve();
}

function getErrorDetail({ details, extendedInfo }) {
  if (details.items) {
    return 'Failing elements:\n' + details.items.map(({ selector, snippet }) => selector + ' - ' + snippet).join('\n');
  }
  if (extendedInfo.value && extendedInfo.value.nodes) {
    return 'Failing elements:\n' + extendedInfo.value.nodes.map(({ target, snippet }) => target[0] + ' - ' + snippet).join('\n');
  }
}

module.exports = {
  run
};
