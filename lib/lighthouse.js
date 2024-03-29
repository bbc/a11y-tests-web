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

const request = require('./request');

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

async function pause(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

/**
 * Wait for the Chrome DevTools Protocol (CDP) to have at least one inspectable
 * target. The CDP needs to be ready before attempting to use it.
 */
async function waitForInspectableTarget(chromeInstance, attempt = 1) {
  const MAX_NUMBER_OF_ATTEMPTS = 50;

  async function checkEndpointReturnsTargets() {
    const response = await request.get(`http://127.0.0.1:${chromeInstance.port}/json/list`);
    const targets = JSON.parse(response);
    return targets.length > 0;
  }

  return new Promise(async (resolve, reject) => {
    if (attempt > MAX_NUMBER_OF_ATTEMPTS) {
      return reject('Failed to find inspectable target, max attempts to connect reached');
    }

    const isReady = await checkEndpointReturnsTargets();

    if (!isReady) {
      logger.warning('Failed to find inspectable target, retrying...');

      try {
        await pause(300);
        await waitForInspectableTarget(chromeInstance, attempt + 1);

        // Need to invoke resolve (or reject) to unblock
        // `waitForInspectableTarget` above us in the recursion stack.
        return resolve();
      } catch (err) {
        return reject(err);
      }
    }

    resolve();
  });
}

async function runTestsForUrl({ url, shouldSignIn, hide, isPretty }) {
  logger.log(`Running audit for ${url}`);

  try {
    const results = await launchChromeAndRunLighthouse(url, shouldSignIn);
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
  } catch (err) {
    logger.error(`An error occurred while launching Chrome and running Lighthouse.\nError: ${err}`);
    process.exit(1);
  }
}

async function launchChromeAndRunLighthouse(url, shouldSignIn) {
  const { flags: lighthouseFlags, config: lightHouseConfig } = LIGHTHOUSE_OPTS;
  const chromeOpts = getChromeOpts();

  let chrome;

  try {
    chrome = await chromeLauncher.launch(chromeOpts);
  } catch (err) {
    return logger.error(`Failed to launch Chrome.\nError: ${err}`);
  }

  try {
    await completeSetupSteps(chrome, url, shouldSignIn);
  } catch (err) {
    return logger.error(`Failed to complete setup steps.\nError: ${err}\nDebug: ${{ chrome, url, shouldSignIn }}`);
  }

  try {
    const flags = {
      ...lighthouseFlags,
      port: chrome.port
    };
    const results = await external.lighthouse(url, flags, lightHouseConfig);
    return results;
  } catch (err) {
    logger.error(`Failed to launch Lighthouse.\nError: ${err}\nDebug: ${{ url, lighthouseFlags, lightHouseConfig }}`);
  } finally {
    await chrome.kill();
  }
}

function getChromeOpts() {
  const defaultOpts = {
    chromeFlags: ['--disable-gpu', '--no-sandbox'],
    connectionPollInterval: 500,
    maxConnectionRetries: 100,
    logLevel: 'error'
  };

  if (process.env.A11Y_HEADLESS) {
    return {
      ...defaultOpts,
      chromeFlags: ['--headless', ...defaultOpts.chromeFlags]
    };
  }

  return defaultOpts;
}

function completeSetupSteps(chrome, url, shouldSignIn) {
  if (shouldSignIn) {
    return signInToBBCID(chrome, url);
  }

  return Promise.resolve();
}

async function signInToBBCID(chrome, url) {
  let chromeProtocols;

  try {
    await waitForInspectableTarget(chrome);
  } catch (err) {
    return logger.error(`Failed to get inspectable target.\nError: ${err}`);
  }

  try {
    chromeProtocols = await external.CDP({ port: chrome.port });
  } catch (err) {
    return logger.error(`Could not obtain chrome protocols.\nError: ${err}`);
  }

  try {
    await loadSignInPage(url, chromeProtocols);
  } catch (err) {
    return logger.error(`Could not load sign in page.\nError: ${err}`);
  }

  try {
    await completeSignInProcess(chromeProtocols);
  } catch (err) {
    return logger.error(`Could not complete sign in process.\nError: ${err}`);
  }
}

async function loadSignInPage(url, { Page }) {
  const encodedUrl = encodeURIComponent(url);
  const signInUrl = `https://account.bbc.com/signin?ptrt=${encodedUrl}`;

  return new Promise(async (resolve) => {
    await Page.enable();
    await Page.navigate({ url: signInUrl });
    await Page.loadEventFired(resolve);
  });
}

function completeSignInProcess({ Page, Runtime }) {
  return new Promise(async (resolve) => {
    const { username, password } = getSignInCredentials();
    const loginScript = `
      document.getElementById('user-identifier-input').value = '${username}';
      document.getElementById('password-input').value = '${password}';
      document.getElementById('submit-button').click();
    `;
    Runtime.evaluate({ expression: loginScript });
    await Page.loadEventFired(resolve);
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
