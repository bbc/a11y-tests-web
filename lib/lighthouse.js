'use strict';

const chromeLauncher = require('chrome-launcher');
const external = require('./external');
const fs = require('fs');
const reportBuilder = require('junit-report-builder');

const logger = require('./colourfulLog');
const {
  getConfigName,
  getConfig,
  getOutputJson,
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

const jsonOutput = {
  urls: []
};

function run() {
  const configName = getConfigName();
  const config = getConfig(configName);
  const lighthouseConfig = getLighthouseConfig(config);
  const baseUrl = config.baseUrl || 'http://www.bbc.co.uk';
  const domain = baseUrl.replace(/(https?:\/\/)/, '');
  const paths = config.paths || [];
  const hide = config.options && config.options.hide || [];
  const signedInPaths = getSignedInPaths(config);

  if (!paths.length && !signedInPaths.length) {
    logger.error(`No paths listed in the config for ${configName}`);
    process.exit(1);
  }

  const signedOutTasks = paths.map((path) => () => runTestsForUrl({ url: baseUrl + path, shouldSignIn: false, hide, lighthouseConfig }));
  const signedInTasks = signedInPaths.map((path) => () => runTestsForUrl({ url: baseUrl + path, shouldSignIn: true, hide, lighthouseConfig }));
  const tasks = [...signedOutTasks, ...signedInTasks];

  logger.log(`Tests will run against: ${domain} ${paths.join(' ')}`);
  if (signedInPaths.length) {
    logger.log(`Tests will run signed in against: ${domain} ${signedInPaths.join(' ')}`);
  }

  return executeSequentially(tasks)
    .then(() => {
      const outputXml = reportBuilder.build();
      fs.writeFileSync(__dirname + '/../lighthouse-report.xml', outputXml);
      const outputJson = JSON.stringify(jsonOutput);
      const jsonPath = getOutputJson();
      fs.writeFileSync(__dirname + jsonPath, outputJson);
      logger.log(outputXml);
    });
}

function getScoresPerCategory(reportCategories = [], url) {
  const results = reportCategories.map((category) => {
    return {
      name: category.name,
      score: category.score
    };
  });

  return { url, results };
}

function runTestsForUrl({ url, shouldSignIn, hide, lighthouseConfig }) {
  logger.log(`Running audit for ${url}`);
  return launchChromeAndRunLighthouse(url, shouldSignIn, lighthouseConfig)
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
          const a11yPwaSeo = erroredElements.filter((e) => e.type === 'node' || e.any === null);
          const bestPractices = erroredElements.filter((e) => e.type !== 'node' || e.any !== null);

          if (a11yPwaSeo.length > 0) {
            const errorDetail = getA11ySeoPwaErrorDetail(a11yPwaSeo);
            testCase.failure(errorMessage + errorDetail);
          }

          if (bestPractices.length > 0) {
            const errorDetail = getBestPracticeErrorDetail(bestPractices);
            testCase.failure(errorMessage + errorDetail);
          }
        }
      });
      return results;
    })
    .then((results) => {
      const scores = getScoresPerCategory(results.reportCategories, url);
      jsonOutput.urls.push(scores);
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}

function getLighthouseConfig(config) {
  return config.hasOwnProperty('LIGHTHOUSE_OPTS') ? config.LIGHTHOUSE_OPTS : LIGHTHOUSE_OPTS;
}

function launchChromeAndRunLighthouse(url, shouldSignIn, lighthouseConfig) {
  const { flags: lighthouseFlags, config: lightHouseConfig } = lighthouseConfig;
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

function getA11ySeoPwaErrorDetail(elements) {
  return 'Failing elements:\n' + elements.map(({ selector, target, snippet }) => (selector || target[0]) + ' - ' + snippet).join('\n');
}

function getBestPracticeErrorDetail(elements) {
  return 'Failing elements:\n' + elements.map((el) => JSON.stringify(el)).join('\n');
}

function selectorIsHidden(selector, hide) {
  return !!hide.find((hideOption) => selector.includes(hideOption));
}

module.exports = {
  run
};
