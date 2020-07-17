#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const yargs = require('yargs');
const { clean: cleanBbcA11y, build: buildBbcA11y } = require('./lib/bbcA11y');
const { run: runLighthouse } = require('./lib/lighthouse');
const logger = require('./lib/colourfulLog');

yargs
  .usage('Usage: A11Y_CONFIG=<config-name> $0 <tool> [options] -- [tool options]')
  .command('bbc-a11y', 'Runs bbc-a11y', runBbcA11yCli)
  .command('lighthouse', 'Runs Google Lighthouse', runLighthouseCli)
  .demandCommand()
  .alias('h', 'help')
  .alias('m', 'mode')
  .describe('m', 'The mode to run the specified tool in')
  .choices('m', ['interactive', 'headless', 'junit', 'junit-headless', 'ci'])
  .demandOption('m', 'You must specify a mode to run the tool in, e.g. junit-headless')
  .argv;

async function runBbcA11yCli({ argv }) {
  buildBbcA11y();

  const { mode } = argv;
  const runBbcA11y = mode === 'ci' ? runBbcA11yInCiMode : runBbcA11yOnHost;

  const bbcA11yExitCode = await runBbcA11y(argv);

  cleanBbcA11y();
  process.exit(bbcA11yExitCode);
}

function runLighthouseCli({ argv }) {
  const { mode } = argv;
  const validModes = ['junit', 'junit-headless', 'headless'];

  if (validModes.includes(mode)) {
    if (mode === 'junit-headless' || mode === 'headless') {
      process.env.A11Y_HEADLESS = true;
    }
    if (mode === 'headless') {
      process.env.A11Y_PRETTY = 'true';
    }
    return runLighthouse();
  }

  logger.error(`Unknown mode. Lighthouse is only supported in the following modes: ${validModes.join(', ')}`);
}

function getBbcA11yArgs(mode) {
  switch (mode) {
    case 'headless':
      return [];
    case 'junit':
      return ['--interactive', '--reporter', './lib/bbcA11YJUnitReporter.js'];
    case 'junit-headless':
      return ['--reporter', './lib/bbcA11YJUnitReporter.js'];
    default:
      return ['--interactive'];
  }
}

function runBbcA11yOnHost(argv) {
  return new Promise((resolve) => {
    const { mode } = argv;
    const bbcA11yArgs = getBbcA11yArgs(mode);
    const configFile = path.resolve(`${__dirname}/a11y.js`);
    const bbcA11y = spawn('bbc-a11y', ['--config', configFile, ...bbcA11yArgs, ...argv._.slice(1)]);
    bbcA11y.stdout.pipe(process.stdout);
    bbcA11y.stderr.pipe(process.stderr);

    bbcA11y.on('close', (exitCode) => {
      resolve(exitCode);
    });
  });
}

function runBbcA11yInCiMode(argv) {
  const dockerArgs = ['run', '--rm', '--tty', '--volume', `${__dirname}:/ws`, 'bbca11y/bbc-a11y-docker', '--config', '/ws/a11y.js', '--reporter', '/ws/lib/bbcA11YJUnitReporter.js'];
  return new Promise((resolve) => {
    const bbcA11yDocker = spawn('docker', [...dockerArgs, ...argv._.slice(1)]);
    bbcA11yDocker.stdout.pipe(process.stdout);
    bbcA11yDocker.stderr.pipe(process.stderr);

    bbcA11yDocker.on('close', () => {
      resolve(0);
    });
  });
}
