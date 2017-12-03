'use strict';

const fs = require('fs');
const minify = require('harp-minify');
const sandbox = require('sinon').sandbox.create();

const bbcA11y = require('../../lib/bbcA11y');
const colourfulLog = require('../../lib/colourfulLog');

function getMinifiedMatcher(code) {
  return (value) => {
    const minifiedCode = minify.js(code);
    const minifiedValue = minify.js(value);
    return minifiedCode === minifiedValue;
  };
}

const VISIT_OPTION_BODY = `
  return new Promise(function (test) {
    frame.onload = function () {
      var loginPage = frame.contentDocument;
      loginPage.getElementById('user-identifier-input').value = 'my-username';
      loginPage.getElementById('password-input').value = 'my-password';
      loginPage.getElementById('submit-button').click();
      frame.onload = test
    }
  })
`;

describe('bbcA11y', () => {

  let originalEnv;
  let originalExit;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
    originalExit = process.exit;
    sandbox.stub(process, 'exit');
    sandbox.stub(colourfulLog, 'error');
    sandbox.stub(colourfulLog, 'log');
    sandbox.stub(colourfulLog, 'warning');
    sandbox.stub(fs, 'writeFileSync');
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    sandbox.restore();
  });

  describe('build()', () => {

    describe('No A11Y_CONFIG', () => {

      it('logs the error message about no config', () => {
        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.error, 'No config selected. Use the A11Y_CONFIG environment variable to set one.');
      });

      it('exits with status code 1', () => {
        bbcA11y.build();

        sandbox.assert.calledWith(process.exit, 1);
      });

    });

    describe('No config with the given name', () => {

      it('logs the error message about no config', () => {
        process.env.A11Y_CONFIG = 'this-is-not-a-valid-config';
        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.error, 'Could not find a valid config named this-is-not-a-valid-config');
      });

      it('exits with status code 1', () => {
        process.env.A11Y_CONFIG = 'this-is-not-a-valid-config';
        bbcA11y.build();

        sandbox.assert.calledWith(process.exit, 1);
      });

    });

    describe('No paths in the config', () => {

      it('logs the error message about no paths', () => {
        process.env.A11Y_CONFIG = 'test/no-paths';
        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.error, 'No paths listed in the config for test/no-paths');
      });

      it('exits with status code 1', () => {
        process.env.A11Y_CONFIG = 'test/no-paths';
        bbcA11y.build();

        sandbox.assert.calledWith(process.exit, 1);
      });

    });

    describe('Paths but no baseUrl or options', () => {

      it('outputs the basic config for the paths, with the baseUrl set to http://www.bbc.co.uk', () => {
        process.env.A11Y_CONFIG = 'test/just-paths';
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
        process.env.A11Y_CONFIG = 'test/paths-and-baseurl';
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

    describe('Paths and signed in paths and baseUrl but no options', () => {

      it('outputs the basic config for the paths but not signed in paths when no username and/or password', () => {
        process.env.A11Y_CONFIG = 'test/paths-with-signed-in-and-baseurl';
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

      it('logs a warning when no username and/or password', () => {
        process.env.A11Y_CONFIG = 'test/paths-with-signed-in-and-baseurl';

        bbcA11y.build();

        sandbox.assert.calledWith(colourfulLog.warning, 'Skipping signed in paths because a username and/or password were not specified. (Use A11Y_USERNAME and A11Y_PASSWORD environment variables to set them)');
      });

      it('outputs the basic config for the paths and signed in paths when username and password provided', () => {
        process.env.A11Y_CONFIG = 'test/paths-with-signed-in-and-baseurl';
        process.env.A11Y_USERNAME = 'my-username';
        process.env.A11Y_PASSWORD = 'my-password';
        const expectedOutput = `
          page("http://base.url/path/1", {})

          page("http://base.url/path/2", {})

          page("http://base.url/path/3",
            {
              visit: function (frame) {
                frame.src = 'https://account.bbc.com/signin?ptrt=http%3A%2F%2Fbase.url%2Fpath%2F3';
                ${VISIT_OPTION_BODY}
              }
            }
          )

          page("http://base.url/path/4",
            {
              visit: function (frame) {
                frame.src = 'https://account.bbc.com/signin?ptrt=http%3A%2F%2Fbase.url%2Fpath%2F4';
                ${VISIT_OPTION_BODY}
              }
            }
          )
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

  describe('Paths and signed in paths and baseUrl and options', () => {

    it('outputs the config for the paths and signed in paths when username and password provided with the options provided', () => {
      process.env.A11Y_CONFIG = 'test/paths-with-signed-in-and-baseurl-and-options';
      process.env.A11Y_USERNAME = 'my-username';
      process.env.A11Y_PASSWORD = 'my-password';
      const expectedOutput = `
        page("http://base.url/path/1", {
          some: "option"
        })

        page("http://base.url/path/2", {
          some: "option"
        })

        page("http://base.url/path/3",
          {
            visit: function (frame) {
              frame.src = 'https://account.bbc.com/signin?ptrt=http%3A%2F%2Fbase.url%2Fpath%2F3';
              ${VISIT_OPTION_BODY}
            },
            some: "option"
          }
        )

        page("http://base.url/path/4",
          {
            visit: function (frame) {
              frame.src = 'https://account.bbc.com/signin?ptrt=http%3A%2F%2Fbase.url%2Fpath%2F4';
              ${VISIT_OPTION_BODY}
            },
            some: "option"
          }
        )
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
