'use strict';

const chromeLauncher = require('chrome-launcher');
const external = require('../../lib/external');
const fs = require('fs');
const minify = require('harp-minify');
const reportBuilder = require('junit-report-builder');
const sandbox = require('sinon').sandbox.create();

const colourfulLog = require('../../lib/colourfulLog');
const lighthouseRunner = require('../../lib/lighthouse');
const fakeResults = require('../fixtures/lighthouseReport');

function getMinifiedMatcher(code) {
  return (value) => {
    const minifiedCode = minify.js(code);
    const minifiedValue = minify.js(value);
    return minifiedCode === minifiedValue;
  };
}

const EXPECTED_LIGHTHOUSE_FLAGS = {
  logLevel: 'silent',
  output: 'json',
  port: 1234
};

const EXPECTED_LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['accessibility']
  },
  categories: {
    accessibility: {
      weight: 1
    }
  }
};

const EXPECTED_LOGIN_SCRIPT = `
  document.getElementById('user-identifier-input').value = 'my-username';
  document.getElementById('password-input').value = 'my-password';
  document.getElementById('submit-button').click();
`;

describe('lighthouse', () => {

  let originalEnv;
  let originalExit;
  let chromeKill;
  let fakeReportBuilderTestSuite;
  let fakeCDP;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
    originalExit = process.exit;
    chromeKill = sandbox.stub().resolves();

    sandbox.stub(process, 'exit');
    sandbox.stub(colourfulLog, 'error');
    sandbox.stub(colourfulLog, 'log');
    sandbox.stub(colourfulLog, 'warning');
    sandbox.stub(fs, 'writeFileSync');

    sandbox.stub(chromeLauncher, 'launch').resolves({
      port: 1234,
      kill: chromeKill
    });

    fakeCDP = {
      Page: {
        enable: sandbox.stub().resolves(),
        navigate: sandbox.stub().resolves(),
        loadEventFired: sandbox.stub().yields()
      },
      Runtime: {
        evaluate: sandbox.stub()
      }
    };
    sandbox.stub(external, 'CDP').resolves(fakeCDP);
    sandbox.stub(external, 'lighthouse').resolves(fakeResults);

    fakeReportBuilderTestSuite = {
      name: sandbox.stub(),
      time: sandbox.stub(),
      testCase: sandbox.stub().returns({
        className: sandbox.stub(),
        name: sandbox.stub(),
        failure: sandbox.stub(),
        time: sandbox.stub()
      })
    };
    sandbox.stub(reportBuilder, 'testSuite').returns(fakeReportBuilderTestSuite);
    sandbox.stub(reportBuilder, 'build').returns('Built report');
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    sandbox.restore();
  });

  after(() => {
  });

  describe('run()', () => {

    describe('No A11Y_CONFIG', () => {

      it('logs the error message about no config', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(colourfulLog.error, 'No config selected. Use the A11Y_CONFIG environment variable to set one.');
        });
      });

      it('exits with status code 1', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(process.exit, 1);
        });
      });

    });

    describe('No config with the given name', () => {
      beforeEach(() => {
        process.env.A11Y_CONFIG = 'this-is-not-a-valid-config';
      });

      it('logs the error message about no config', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(colourfulLog.error, 'Could not find a valid config named this-is-not-a-valid-config');
        });
      });

      it('exits with status code 1', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(process.exit, 1);
        });
      });

    });

    describe('No paths in the config', () => {
      beforeEach(() => {
        process.env.A11Y_CONFIG = 'test/no-paths';
      });

      it('logs the error message about no paths', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(colourfulLog.error, 'No paths listed in the config for test/no-paths');
        });
      });

      it('exits with status code 1', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(process.exit, 1);
        });
      });

    });

    describe('Paths but no baseUrl', () => {
      beforeEach(() => {
        process.env.A11Y_CONFIG = 'test/just-paths';
      });

      it('launches chrome once per path with the right options', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(chromeLauncher.launch, { chromeFlags: ['--disable-gpu', '--no-sandbox'] });
          sandbox.assert.calledTwice(chromeLauncher.launch);
        });
      });

      it('launches lighthouse with the base url and path, flags and config', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledTwice(external.lighthouse);
          sandbox.assert.calledWith(
            external.lighthouse,
            'http://www.bbc.co.uk/path/1',
            EXPECTED_LIGHTHOUSE_FLAGS,
            EXPECTED_LIGHTHOUSE_CONFIG
          );
        });
      });

      it('kills Chrome at the end', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.called(chromeKill);
        });
      });

      it('creates a test suite for each URL using default base URL', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledTwice(reportBuilder.testSuite);
          sandbox.assert.calledWith(reportBuilder.testSuite().name, 'www.bbc.co.uk./path/1');
          sandbox.assert.calledWith(reportBuilder.testSuite().name, 'www.bbc.co.uk./path/2');
        });
      });

      it('sets the duration for the test suite', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledTwice(reportBuilder.testSuite);
          sandbox.assert.calledWith(reportBuilder.testSuite().time, 123456);
        });
      });

      it('creates a test case for each result, with classname, name and time', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(reportBuilder.testSuite().testCase().className, 'www.bbc.co.uk./path/1');
          sandbox.assert.calledWith(reportBuilder.testSuite().testCase().name, '`[role]` values are valid.');
          sandbox.assert.calledWith(reportBuilder.testSuite().testCase().time, 41152);
        });
      });

      it('sets the correct error message for failed tests that have error details', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(
            reportBuilder.testSuite().testCase().failure,
            'Error on http://www.bbc.co.uk/path/1\n' +
            'Low-contrast text is difficult or impossible for many users to read. [Learn more](https://dequeuniversity.com/rules/axe/2.2/color-contrast?application=lighthouse).\n' +
            '\n' +
            'Failing elements:\n' +
            'span > strong - <strong>'
          );
        });
      });

      it('sets the correct error message for failed tests that have extended info', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(
            reportBuilder.testSuite().testCase().failure,
            'Error on http://www.bbc.co.uk/path/2\n' +
            'Labels ensure that form controls are announced properly by assistive technologies, like screen readers. [Learn more](https://dequeuniversity.com/rules/axe/2.2/label?application=lighthouse).\n' +
            '\n' +
            'Failing elements:\n' +
            '#orb-modules form > input[type="text"][name="q"] - <input class="search-bar" name="q" placeholder="Search">'
          );
        });
      });

      it('logs the error and exists if something goes wrong reading the results', () => {
        external.lighthouse.resolves('this is not an object');

        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(colourfulLog.error, sandbox.match.any);
          sandbox.assert.calledWith(process.exit, 1);
        });
      });

      it('outputs the report to the file and the logging output', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledOnce(reportBuilder.build);
          sandbox.assert.calledWith(fs.writeFileSync, sandbox.match(/lighthouse-report\.xml$/), 'Built report');
          sandbox.assert.calledWith(colourfulLog.log, 'Built report');
        });
      });

    });

    describe('Paths and baseUrl', () => {
      beforeEach(() => {
        process.env.A11Y_CONFIG = 'test/paths-and-baseurl';
      });

      it('launches lighthouse with the base url and path, flags and config', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledTwice(external.lighthouse);
          sandbox.assert.calledWith(
            external.lighthouse,
            'http://base.url/path/1',
            EXPECTED_LIGHTHOUSE_FLAGS,
            EXPECTED_LIGHTHOUSE_CONFIG
          );
        });
      });

      it('creates a test suite for each URL using the base URL', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledTwice(reportBuilder.testSuite);
          sandbox.assert.calledWith(reportBuilder.testSuite().name, 'base.url./path/1');
          sandbox.assert.calledWith(reportBuilder.testSuite().name, 'base.url./path/2');
        });
      });

      it('creates a test case for each result, with correct classname', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(reportBuilder.testSuite().testCase().className, 'base.url./path/1');
        });
      });
    });

    describe('Paths and signed in paths and baseUrl but no username and password', () => {
      beforeEach(() => {
        process.env.A11Y_CONFIG = 'test/paths-with-signed-in-and-baseurl';
      });

      it('launches lighthouse for the signed out paths only', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledTwice(external.lighthouse);
          sandbox.assert.calledWith(external.lighthouse, 'http://base.url/path/1');
          sandbox.assert.calledWith(external.lighthouse, 'http://base.url/path/2');
        });
      });

      it('logs a warning about skipping signed in paths', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(colourfulLog.warning, 'Skipping signed in paths because a username and/or password were not specified. (Use A11Y_USERNAME and A11Y_PASSWORD environment variables to set them)');
        });
      });
    });

    describe('Paths and signed in paths and baseUrl with a username and password', () => {
      beforeEach(() => {
        process.env.A11Y_CONFIG = 'test/paths-with-signed-in-and-baseurl';
        process.env.A11Y_USERNAME = 'my-username';
        process.env.A11Y_PASSWORD = 'my-password';
      });

      it('launches lighthouse for the signed out and signed in paths when username and password provided', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.callCount(external.lighthouse, 4);
          sandbox.assert.calledWith(external.lighthouse, 'http://base.url/path/1');
          sandbox.assert.calledWith(external.lighthouse, 'http://base.url/path/2');
          sandbox.assert.calledWith(external.lighthouse, 'http://base.url/path/3');
          sandbox.assert.calledWith(external.lighthouse, 'http://base.url/path/4');
        });
      });

      it('sets up the chrome remote interface with the port that Chrome is running on', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.calledWith(external.CDP, sandbox.match({ port: 1234 }));
        });
      });

      it('calls Page.enable and then navigates to the sign-in page', () => {
        return lighthouseRunner.run().then(() => {
          sandbox.assert.called(fakeCDP.Page.enable);
          sandbox.assert.calledWith(fakeCDP.Page.navigate, sandbox.match({ url: 'https://account.bbc.com/signin?ptrt=http%3A%2F%2Fbase.url%2Fpath%2F3' }));
        });
      });

      it('completes the sign-in process', () => {
        return lighthouseRunner.run().then(() => {
          const matcher = getMinifiedMatcher(EXPECTED_LOGIN_SCRIPT);
          sandbox.assert.calledWith(fakeCDP.Runtime.evaluate, sandbox.match({
            expression: sandbox.match(matcher)
          }));
        });
      });

    });

  });

});
