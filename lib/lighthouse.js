'use strict';

const chromeLauncher = require('chrome-launcher');
const external = require('./external');
const fs = require('fs');
const reportBuilder = require('junit-report-builder');
const xunitViewer = require('./xunitViewer');

const logger = require('./colourfulLog');
const {
  getConfigName,
  getConfig,
  getSignedInPaths,
  getSignInCredentials,
  getLoggingLevel
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
    logLevel: getLoggingLevel(),
    output: 'json'
  }
};

function run() {
  const configName = getConfigName();
  const config = getConfig(configName);
  const isPretty = process.env.A11Y_PRETTY === 'true';
  const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
  const domain = baseUrl.replace(/(https?:\/\/)/, '');
  const paths = config.paths || [];
  const hide = config.options && config.options.hide || [];
  const signedInPaths = getSignedInPaths(config);

  if (!paths.length && !signedInPaths.length) {
    logger.error(`No paths listed in the config for ${configName}`);
    process.exit(1);
  }

  const signedOutTasks = paths.map((path) => () => runTestsForUrl({ url: baseUrl + path, shouldSignIn: false, hide, isPretty }));
  const signedInTasks = signedInPaths.map((path) => () => runTestsForUrl({ url: baseUrl + path, shouldSignIn: true, hide, isPretty }));

  const tasks = [...signedOutTasks, ...signedInTasks];

  logger.log(`Tests will run against: ${domain} ${paths.join(' ')}`);
  if (signedInPaths.length) {
    logger.log(`Tests will run signed in against: ${domain} ${signedInPaths.join(' ')}`);
  }

  return executeSequentially(tasks)
    .then(() => {
      const output = reportBuilder.build();
      fs.writeFileSync(`${process.cwd()}/lighthouse-report.xml`, output);
      if (!isPretty) {
        logger.log(output);
      } else {
        xunitViewer.toConsole();
      }
    });
}

function runTestsForUrl({ url, shouldSignIn, hide, isPretty }) {
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
        if (!isPretty) {
          testCase.time(testCaseTime);
        }

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
      logger.error('An error occurding while launching Chrome and running Lighthouse');
      console.error(err);
      process.exit(1);
    });
}

async function launchChromeAndRunLighthouse(url, shouldSignIn) {
  const { flags: lighthouseFlags, config: lightHouseConfig } = LIGHTHOUSE_OPTS;
  const chromeOpts = getChromeOpts();

  let chrome;
  let results;

  try {
    chrome = await chromeLauncher.launch(chromeOpts);
  } catch (err) {
    return console.error('Failed to launch Chrome', err);
  }

  try {
    await completeSetupSteps(chrome, url, shouldSignIn);
  } catch (err) {
    return console.error('Failed to complete setup steps', { chrome, url, shouldSignIn }, err);
  }

  try {
    lighthouseFlags.port = chrome.port;
    results = await external.lighthouse(url, lighthouseFlags, lightHouseConfig);
  } catch (err) {
    console.error('Failed to launch Lighthouse', { url, lighthouseFlags, lightHouseConfig }, err);
  }

  try {
    await chrome.kill();
  } catch (err) {
    return console.error('Failed to quit Chrome', err);
  }

  return results;
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

async function signInToBBCID(chrome, url) {
  const chromeProtocols = await external.CDP({ port: chrome.port });
  await loadSignInPage(url, chromeProtocols);
  await completeSignInProcess(chromeProtocols);
}

async function loadSignInPage(url, { Page }) {
  const encodedUrl = encodeURIComponent(url);
  const signInUrl = `https://account.bbc.com/signin?ptrt=${encodedUrl}`;

  return new Promise(async (resolve) => {
    await Page.enable();
    await Page.navigate({ url: signInUrl });
    console.log('load sign in page - page navigated to');
    await Page.loadEventFired(() => {
      console.log('load sign in page - load event fired');
      return resolve();
    });
  });
}

function completeSignInProcess({ Page, Runtime }) {
  return new Promise(async (resolve) => {
    console.log('sign in process - about to try to sign in');
    const { username, password } = getSignInCredentials();
    const loginScript = `
      document.getElementById('user-identifier-input').value = '${username}';
      document.getElementById('password-input').value = '${password}';
      document.getElementById('submit-button').click();
    `;
    Runtime.evaluate({ expression: loginScript });
    console.log('sign in process - login script invoked');
    await Page.loadEventFired(() => {
      console.log('sign in process - load event fired');
      return resolve();
    });
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
