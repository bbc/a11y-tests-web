const fs = require('fs');
const path = require('path');

const PATHS_FILE = 'paths.txt';
const A11Y_JS_FILE = 'a11y.js';

const baseUrl = (process.env.A11Y_BASE_URL || "http://www.bbc.co.uk").trim();
const pathsContents = getPathsContent();
const paths = pathsContents
  .split('\n')
  .map(sanitisePath)
  .filter((value) => value !== '');

const a11yOutput = paths.reduce(
  (acc, cur) => acc + pathToOutput(baseUrl, cur),
  ''
);

fs.writeFileSync(A11Y_JS_FILE, a11yOutput);

console.log(`Tests will run against: ${baseUrl.replace(/(https?:\/\/)/, '')} ${paths.join(" ")}`);

function pathToOutput(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  const setupSteps = getSetup(url);
  return `
    page("${url}", {
      ${setupSteps}
      hide: ['orb', 'bbccookies-prompt', '/html/head/iframe', 'smphtml5iframebbcMediaPlayer'],
      skip: [
        'Title attributes: Title attributes only on inputs'
      ]
    })`;
}

function getPathsContent() {
  return process.env.A11Y_PATHS || fs.readFileSync(PATHS_FILE, { encoding: 'utf-8' });
}

function sanitisePath(path) {
  return path.trim();
}

function getSetup(url) {
  const { A11Y_USERNAME: username, A11Y_PASSWORD: password } = process.env;
  if (username && password) {
    const encodedUrl = encodeURIComponent(url);
    return `
      visit: function (frame) {
        frame.src = 'https://account.bbc.com/signin?ptrt=${encodedUrl}'
        return new Promise(function (test) {
          frame.onload = function () {
            var loginPage = frame.contentDocument;
            loginPage.getElementById('username-input').value = '${username}';
            loginPage.getElementById('password-input').value = '${password}';
            loginPage.getElementById('submit-button').click();
            frame.onload = test
          }
        })
      },`;
  }
  return '';
}