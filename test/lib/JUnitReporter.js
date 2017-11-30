'use strict';

const assert = require('assert');
const fs = require('fs');
const builder = require('junit-report-builder');
const sandbox = require('sinon').sandbox.create();

const JUnitReporter = require('../../lib/jUnitReporter');

const commandLineConsole = {
  log: () => {}
};

function getJunitReporter() {
  return new JUnitReporter(() => {}, commandLineConsole)
}

describe('JUnit Reporter', () => {

  beforeEach(() => {
    sandbox.stub(commandLineConsole, 'log');
    sandbox.stub(builder, 'build').returns('Built report');
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