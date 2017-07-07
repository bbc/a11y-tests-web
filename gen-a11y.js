const fs = require('fs');
const path = require('path');

const PATHS_FILE = 'paths.txt';
const A11Y_JS_FILE = 'a11y.js';

const pathsContents = getPathsContent();
const paths = pathsContents.split('\n').filter((value) => value.trim() !== '');
const a11yOutput = paths.reduce((acc, cur) => acc + pathToOutput(cur), '');

fs.writeFileSync(A11Y_JS_FILE, a11yOutput);

function pathToOutput(path) {
  const baseUrl = process.env.A11Y_BASE_URL || "http://www.bbc.co.uk";
  return `
    page("${baseUrl}${path}", {
      hide: ['orb', 'bbccookies-prompt']
    })`;
}

function getPathsContent() {
  return process.env.A11Y_PATHS || fs.readFileSync(PATHS_FILE, { encoding: 'utf-8' });
}
