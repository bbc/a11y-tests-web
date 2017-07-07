const fs = require('fs');
const path = require('path');

const PATHS_FILE = 'paths.txt';
const A11Y_JS_FILE = 'a11y.js';

const baseUrl = process.env.A11Y_BASE_URL || "http://www.bbc.co.uk";
const pathsContents = getPathsContent();
const paths = pathsContents.split('\n').filter((value) => value.trim() !== '');
const a11yOutput = paths.reduce((acc, cur) => acc + pathToOutput(baseUrl, cur), '');

fs.writeFileSync(A11Y_JS_FILE, a11yOutput);

console.log(`Tests will run against: ${baseUrl.replace(/(https?:\/\/)/, '')} ${paths.join(" ")}`);

function pathToOutput(baseUrl, path) {
  return `
    page("${baseUrl}${path}", {
      hide: ['orb', 'bbccookies-prompt']
    })`;
}

function getPathsContent() {
  return process.env.A11Y_PATHS || fs.readFileSync(PATHS_FILE, { encoding: 'utf-8' });
}
