'use strict';

const fs = require('fs');

const bbcA11y = require('../../lib/bbcA11y');
const colourfulLog = require('../../lib/colourfulLog');
const sandbox = require('sinon').sandbox.create();

function minify(code) {
  return code.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
}

function getMinifiedMatcher(code) {
  return (value) => {
    const minifiedCode = minify(code);
    const minifiedValue = minify(value);
    return minifiedCode === minifiedValue;
  };
}

describe('bbcA11y', () => {

  let originalEnv;
  let originalExit;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
    originalExit = process.exit;
    sandbox.stub(process, 'exit');
    sandbox.stub(colourfulLog, 'error');
    sandbox.stub(colourfulLog, 'log');
    sandbox.stub(fs, 'writeFileSync');
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

    describe('No paths in the config', () => {

      it('logs the error message about no paths', () => {
        process.env.BBC_A11Y_CONFIG = 'test-no-paths';
        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.error, 'No paths listed in the config for test-no-paths');
      });

      it('exits with status code 1', () => {
        process.env.BBC_A11Y_CONFIG = 'test-no-paths';
        bbcA11y.build();

        sandbox.assert.calledWith(process.exit, 1);
      });

    });

    describe('Paths but no baseUrl or options', () => {

      it('outputs the basic config for the paths, with the baseUrl set to http://www.bbc.co.uk', () => {
        process.env.BBC_A11Y_CONFIG = 'test-just-paths';
        const expectedOutput = `
          page( "http://www.bbc.co.uk/path/1", { } )
          page( "http://www.bbc.co.uk/path/2", { } )
        `;
        const matcher = getMinifiedMatcher(expectedOutput);

        bbcA11y.build();

        sandbox.assert.calledWith(
          fs.writeFileSync,
          'a11y.js',
          sandbox.match(matcher)
        );
      });

    });

    describe('Paths and baseUrl but no options', () => {

      it('outputs the basic config for the paths, with the defined baseUrl', () => {
        process.env.BBC_A11Y_CONFIG = 'test-paths-and-baseurl';
        const expectedOutput = `
          page( "http://base.url/path/1", { } )
          page( "http://base.url/path/2", { } )
        `;
        const matcher = getMinifiedMatcher(expectedOutput);

        bbcA11y.build();

        sandbox.assert.calledWith(
          fs.writeFileSync,
          'a11y.js',
          sandbox.match(matcher)
        );
      });

    });

  });

});
