'use strict';

const xunitViewer = require('xunit-viewer');

function xunitToConsole() {
  xunitViewer({
    server: false,
    results: 'lighthouse-report.xml',
    ignore: [],
    title: 'Lighthouse a11y audit complete.',
    console: true,
    output: false
  });
}

module.exports = { xunitToConsole };
