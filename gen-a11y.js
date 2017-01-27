const fs = require('fs');
const path = require('path');

const pathsFile = 'paths.txt';
const a11yJsFile = 'a11y.js';

const pathsContents = fs.readFileSync(pathsFile, { encoding: 'utf-8' });
const paths = pathsContents.split('\n').filter((value) => value.trim() !== '');
const a11yOutput = paths.reduce((acc, cur) => acc + pathToOutput(cur), '');

fs.writeFileSync(a11yJsFile, a11yOutput);

function pathToOutput(path) {
  const baseUrl = process.env.A11Y_BASE_URL || "http://www.bbc.co.uk";
  return `
    page("${baseUrl}${path}", {
      hide: ['orb']
    })`;
}
