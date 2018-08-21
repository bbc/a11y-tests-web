'use strict';

const chromeLauncher = require('chrome-launcher');
const external = require('./external');
const fs = require('fs');
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
      // if you add  'best-practices' or 'performance' to this array, the following will fail: 
      // A11Y_CONFIG=simorgh/simorgh npm run start:lighthouse:junit 
      onlyCategories: ['accessibility', 'seo', 'pwa', 'best-practices']
    },
    categories: {
      accessibility: {
        weight: 1
      }
    }
  },
  flags: {
    logLevel: 'silent',
    output: 'json'g
  }
};

function run() {
  const configName = getConfigName();
  const config = getConfig(configName);
  const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
  const domain = baseUrl.replace(/(https?:\/\/)/, '');
  const paths = config.paths || [];
  const hide = config.options && config.options.hide || [];
  const signedInPaths = getSignedInPaths(config);

  if (!paths.length && !signedInPaths.length) {
    logger.error(`No paths listed in the config for ${configName}`);
    process.exit(1);
  }

  const signedOutTasks = paths.map((path) => () => runTestsForUrl({ url: baseUrl + path, shouldSignIn: false, hide }));
  const signedInTasks = signedInPaths.map((path) => () => runTestsForUrl({ url: baseUrl + path, shouldSignIn: true, hide }));
  const tasks = [...signedOutTasks, ...signedInTasks];

  logger.log(`Tests will run against: ${domain} ${paths.join(' ')}`);
  if (signedInPaths.length) {
    logger.log(`Tests will run signed in against: ${domain} ${signedInPaths.join(' ')}`);
  }

  return executeSequentially(tasks)
    .then(() => {
      const output = reportBuilder.build();
      fs.writeFileSync(__dirname + '/../lighthouse-report.xml', output);
      logger.log(output);
    });
}

function runTestsForUrl({ url, shouldSignIn, hide }) {
  logger.log(`Running audit for ${url}`);
  return launchChromeAndRunLighthouse(url, shouldSignIn)
    .then((results) => {
      const suiteName = url.replace(/.*?:\/\//g, '').replace('\/', './');
      const suite = reportBuilder.testSuite();
      suite.name(suiteName);

      const { audits, timing: { total: suiteDuration } } = results;

      suite.time(suiteDuration);

      const auditKeys = Object.keys(audits).filter((auditKey) => !audits[auditKey].manual);
      const testCaseTime = (suiteDuration / auditKeys.length);

      auditKeys.forEach((auditKey) => {
        const { score, manual, description, helpText, details = {}, extendedInfo = {} } = audits[auditKey];
        const testCase = suite.testCase();
        testCase.className(suiteName);
        testCase.name(description);
        testCase.time(testCaseTime);

        if (score !== true && !manual) {
          const errorMessage = `Error on ${url}\n${helpText}\n\n`;
          const erroredElements = getErroredElements({ details, extendedInfo, hide });

          if (erroredElements.length > 0) {
            const errorDetail = getErrorDetail(erroredElements);
            testCase.failure(errorMessage + errorDetail);
          }
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
          return external.lighthouse(url, lighthouseFlags, lightHouseConfig);
        })
        .then((results) => chrome.kill().then(() => results))
        .catch(() => {
          chrome.kill();
        });
    });
}

function getChromeOpts() {
  const defaultChromeFlags = ['--disable-gpu', '--no-sandbox'];

  if (process.env.A11Y_HEADLESS) {
    return {
      chromeFlags: ['--headless', ...defaultChromeFlags]
    };
  }

  return {
    chromeFlags: defaultChromeFlags
  };
}

function completeSetupSteps(chrome, url, shouldSignIn) {
  if (shouldSignIn) {
    return signInToBBCID(chrome, url);
  }

  return Promise.resolve();
}

function signInToBBCID(chrome, url) {
  return external.CDP({ port: chrome.port })
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

function getErroredElements({ details, extendedInfo, hide }) {
  if (details.items) {
    return details.items.filter(({ selector }) => !selectorIsHidden(selector, hide));
  }
  if (extendedInfo.value && extendedInfo.value.nodes) {
    return extendedInfo.value.nodes.filter(({ target }) => !selectorIsHidden(target[0], hide));
  }
  return [];
}

function getErrorDetail(elements) {
  return 'Failing elements:\n' + elements.map(({ selector, target, snippet }) => (selector || target[0]) + ' - ' + snippet).join('\n');
}

function selectorIsHidden(selector, hide) {
  return !!hide.find((hideOption) => selector.includes(hideOption));
}

module.exports = {
  run
};
