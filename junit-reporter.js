var builder = require('junit-report-builder')
var fs = require('fs');

function JUnitReport(devToolsConsole, commandLineConsole) {
  this.devToolsConsole = devToolsConsole
  this.commandLineConsole = commandLineConsole
}

JUnitReport.prototype.runStarted = function() {
}

JUnitReport.prototype.pageChecked = function(page, validationResult) {
  var suiteName = page.url;
  suiteName = suiteName.replace(/.*?:\/\//g, "").replace('\/', './');
  var suite = builder.testSuite().name(suiteName)

  validationResult.results.forEach(function(standardResult) {
    var standard = standardResult.standard
    var testName = standard.section.title + ': ' + standard.name
    var docsUrl = standard.section.documentationUrl
    var testcase = suite.testCase().className(suiteName).name(testName)

    if (standardResult.errors.length > 0) {
      var errors = standardResult.errors.map(mapErrors)
      testcase.failure('Error on [ ' + page.url + ' ]: ' + errors.join('') + 'More info at ' + docsUrl)
    }
  })
}

JUnitReport.prototype.pagePassed = function(page, validationResult) {}

JUnitReport.prototype.pageFailed = function(page, validationResult) {}

JUnitReport.prototype.runEnded = function() {
  var output = builder.build();
  fs.writeFileSync(__dirname + '/test-report.xml', output);
  this.log(output);
}

JUnitReport.prototype.unexpectedError = function(error) {
  this.log('Error running tests: ' + error.stack)
}

JUnitReport.prototype.configMissing = function(error) {
  this.log('Error running tests: Missing configuration file')
}

JUnitReport.prototype.configError = function(error) {
  this.log('Error running tests: ' + error.stack)
}

JUnitReport.prototype.log = function(message) {
  this.commandLineConsole.log(message)
}

function mapErrors(error) {
  var errorDetails = (error[1] && error[1].xpath) || ''
  return error[0] + ' ' + errorDetails + '             '
}

module.exports = JUnitReport
