'use strict';

const builder = require('junit-report-builder');
const fs = require('fs');

function JUnitReport(devToolsConsole, commandLineConsole) {
  this.devToolsConsole = devToolsConsole;
  this.commandLineConsole = commandLineConsole;
}

JUnitReport.prototype.runStarted = function () {};

JUnitReport.prototype.pageChecked = function (page, validationResult) {
  const suiteName = page.url.replace(/.*?:\/\//g, '').replace('\/', './');
  const suite = builder.testSuite().name(suiteName);

  validationResult.results.forEach((standardResult) => {
    const standard = standardResult.standard;
    const testName = standard.section.title + ': ' + standard.name;
    const docsUrl = standard.section.documentationUrl;
    const testcase = suite.testCase().className(suiteName).name(testName);

    if (standardResult.errors.length > 0) {
      const errors = standardResult.errors.map(prettyErrorOutput);
      testcase.failure('Error on ' + page.url + errors.join('') + '\nMore info at ' + docsUrl);
    }
  });
};

JUnitReport.prototype.pagePassed = function () {};
JUnitReport.prototype.pageFailed = function () {};

JUnitReport.prototype.runEnded = function () {
  const output = builder.build();
  fs.writeFileSync(__dirname + '/../bbc-a11y-report.xml', output);
  this.log(output);
};

JUnitReport.prototype.unexpectedError = function (error) {
  this.log('Unexpected error running tests: ' + error.stack);
};

JUnitReport.prototype.configMissing = function () {
  this.log('Error running tests: Missing configuration file');
};

JUnitReport.prototype.configError = function (error) {
  this.log('Config error whilst running tests: ' + error.stack);
};

JUnitReport.prototype.log = function (message) {
  this.commandLineConsole.log(message);
};

function prettyErrorOutput(error) {
  const errorDetails = (error[1] && error[1].xpath) || '';
  return '\n' + error[0] + ' ' + errorDetails;
}

module.exports = JUnitReport;
