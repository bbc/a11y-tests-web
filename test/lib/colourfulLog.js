'use strict';

const colourfulLog = require('../../lib/colourfulLog');
const sandbox = require('sinon').sandbox.create();

const END_OF_LINE_LOG = '\x1b[0m\n';

describe('colourfulLog', () => {
  beforeEach(() => {
    sandbox.stub(process.stdout, 'write');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('log() calls stdout.write with the log message and end of line escape sequence', () => {
    colourfulLog.log('hi');

    sandbox.assert.calledWith(process.stdout.write, `hi${END_OF_LINE_LOG}`);
    process.stdout.write.restore();
  });

  it('ok() calls stdout.write with the icon, colour, log message and end of line escape sequence', () => {
    const expectedIcon = '\x1b[32m✔\x1b[0m';
    const expectedColour = '\x1b[2m';

    colourfulLog.ok('hi');

    sandbox.assert.calledWith(process.stdout.write, `${expectedIcon} ${expectedColour}hi${END_OF_LINE_LOG}`);
    process.stdout.write.restore();
  });

  it('warning() calls stdout.write with the icon, colour, log message and end of line escape sequence', () => {
    const expectedIcon = '\x1b[33m!\x1b[0m';
    const expectedColour = '\x1b[33m';

    colourfulLog.warning('hi');

    sandbox.assert.calledWith(process.stdout.write, `${expectedIcon} ${expectedColour}hi${END_OF_LINE_LOG}`);
    process.stdout.write.restore();
  });

  it('error() calls stdout.write with the icon, colour, log message and end of line escape sequence', () => {
    const expectedIcon = '\x1b[31m✘\x1b[0m';
    const expectedColour = '\x1b[31m';

    colourfulLog.error('hi');

    sandbox.assert.calledWith(process.stdout.write, `${expectedIcon} ${expectedColour}hi${END_OF_LINE_LOG}`);
    process.stdout.write.restore();
  });
});
