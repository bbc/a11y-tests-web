'use strict';

const bbcA11y = require('../../lib/bbcA11y');
const colourfulLog = require('../../lib/colourfulLog');
const sandbox = require('sinon').sandbox.create();

describe('bbcA11y', () => {

  let originalEnv;
  let originalExit;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
    originalExit = process.exit;
    sandbox.stub(process, 'exit');
    sandbox.stub(colourfulLog, 'error');
    sandbox.stub(colourfulLog, 'log');
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    sandbox.restore();
  });

  describe('build()', () => {

    describe('No BBC_A11Y_CONFIG', () => {

      it('logs the error message about no config', () => {
        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.error, 'No bbc-a11y config selected. Use the BBC_A11Y_CONFIG environment variable to set one.');
      });

      it('exits with status code 1', () => {
        bbcA11y.build();

        sandbox.assert.calledWith(process.exit, 1);
      });

    });

    describe('No config with the given name', () => {

      it('logs the error message about no config', () => {
        process.env.BBC_A11Y_CONFIG = 'this-is-not-a-valid-config';
        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.error, 'Could not find a bbc-a11y config named this-is-not-a-valid-config');
      });

      it('exits with status code 1', () => {
        process.env.BBC_A11Y_CONFIG = 'this-is-not-a-valid-config';
        bbcA11y.build();

        sandbox.assert.calledWith(process.exit, 1);
      });

    });
  });

});
