'use strict';

const assert = require('assert');
const fs = require('fs');
const builder = require('junit-report-builder');
const sandbox = require('sinon').sandbox.create();

const JUnitReporter = require('../../lib/bbcA11YJUnitReporter');

const commandLineConsole = {
  log: () => {}
};
const SOME_RESULTS = [
  {
    standard: {
      section: {
        title: 'Title 1',
        documentationUrl: 'http://documentation.url/1'
      },
      name: 'Standard name 1'
    }
  },
  {
    standard: {
      section: {
        title: 'Title 2',
        documentationUrl: 'http://documentation.url/2'
      },
      name: 'Standard name 2'
    },
    errors: [
      ['An error message', { xpath: 'An/x/path' }],
      ['Another error message']
    ]
  }
];
let fakeReportBuilderTestSuite;

function getJunitReporter() {
  return new JUnitReporter(() => {}, commandLineConsole);
}

describe('JUnit Reporter', () => {

  beforeEach(() => {
    fakeReportBuilderTestSuite = {
      name: sandbox.stub(),
      testCase: sandbox.stub().returns({
        className: sandbox.stub(),
        name: sandbox.stub(),
        failure: sandbox.stub()
      })
    };
    sandbox.stub(commandLineConsole, 'log');
    sandbox.stub(builder, 'build').returns('Built report');
    sandbox.stub(builder, 'testSuite').returns(fakeReportBuilderTestSuite);
    sandbox.stub(fs, 'writeFileSync');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('runStarted()', () => {

    it('is a function', () => {
      const junitReporter = getJunitReporter();
      assert.equal(typeof junitReporter.runStarted, 'function');
    });

  });

  describe('pageChecked()', () => {

    it('creates a test suite with the URL converted to a package name', () => {
      const page = { url: 'https://www.bbc.co.uk/product' };
      const results = [];
      const result = { results };
      const junitReporter = getJunitReporter();

      junitReporter.pageChecked(page, result);

      sandbox.assert.calledWith(fakeReportBuilderTestSuite.name, 'www.bbc.co.uk./product');
    });

    it('creates a test class for each result', () => {
      const page = { url: 'https://www.bbc.co.uk/product' };
      const result = { results: SOME_RESULTS };
      const junitReporter = getJunitReporter();

      junitReporter.pageChecked(page, result);

      sandbox.assert.calledTwice(fakeReportBuilderTestSuite.testCase);
      sandbox.assert.alwaysCalledWith(fakeReportBuilderTestSuite.testCase().className, 'www.bbc.co.uk./product');
      sandbox.assert.calledWith(fakeReportBuilderTestSuite.testCase().name, 'Title 1: Standard name 1');
      sandbox.assert.calledWith(fakeReportBuilderTestSuite.testCase().name, 'Title 2: Standard name 2');
    });

    it('reports the failure if there are errors', () => {
      const page = { url: 'https://www.bbc.co.uk/product' };
      const result = { results: SOME_RESULTS };
      const junitReporter = getJunitReporter();

      junitReporter.pageChecked(page, result);

      sandbox.assert.calledOnce(fakeReportBuilderTestSuite.testCase().failure);
      sandbox.assert.calledWith(
        fakeReportBuilderTestSuite.testCase().failure,
        'Error on https://www.bbc.co.uk/product\n' +
        'An error message An/x/path\n' +
        'Another error message \n' +
        'More info at http://documentation.url/2'
      );
    });
  });

  describe('pagePassed()', () => {

    it('is a function', () => {
      const junitReporter = getJunitReporter();
      assert.equal(typeof junitReporter.pagePassed, 'function');
    });

  });

  describe('pageFailed()', () => {

    it('is a function', () => {
      const junitReporter = getJunitReporter();
      assert.equal(typeof junitReporter.pageFailed, 'function');
    });

  });

  describe('runEnded()', () => {

    it('outputs the output to the bbc-a11y-report.xml file', () => {
      const junitReporter = getJunitReporter();

      junitReporter.runEnded();

      sandbox.assert.calledWith(fs.writeFileSync, sandbox.match(/bbc-a11y-report\.xml$/), 'Built report');
    });

    it('outputs the output to the command line console', () => {
      const junitReporter = getJunitReporter();

      junitReporter.runEnded();

      sandbox.assert.calledWith(commandLineConsole.log, 'Built report');
    });

  });

  describe('unexpectedError()', () => {

    it('logs the error', () => {
      const junitReporter = getJunitReporter();

      junitReporter.unexpectedError({ stack: 'stack trace' });

      sandbox.assert.calledWith(commandLineConsole.log, 'Unexpected error running tests: stack trace');
    });

  });

  describe('configMissing()', () => {

    it('logs the error', () => {
      const junitReporter = getJunitReporter();

      junitReporter.configMissing();

      sandbox.assert.calledWith(commandLineConsole.log, 'Error running tests: Missing configuration file');
    });

  });

  describe('configError()', () => {

    it('logs the error', () => {
      const junitReporter = getJunitReporter();

      junitReporter.configError({ stack: 'stack trace' });

      sandbox.assert.calledWith(commandLineConsole.log, 'Config error whilst running tests: stack trace');
    });

  });

  describe('log()', () => {

    it('logs the message to the command line console', () => {
      const junitReporter = getJunitReporter();

      junitReporter.log('a message');

      sandbox.assert.calledWith(commandLineConsole.log, 'a message');
    });

  });
});
