#!/usr/bin/env node
const { spawn } = require('child_process');
const yargs = require('yargs');
const { clean: cleanBbcA11y, build: buildBbcA11y } = require('./lib/bbcA11y');

const argv = yargs
  .usage('Usage: $0 <tool> [options] -- [tool options]')
  .command('bbc-a11y', 'Runs bbc-a11y', runBbcA11y)
  .command('lighthouse', 'Runs Google Lighthouse', runLighthouse)
  .alias('h', 'help')
  .alias('m', 'mode')
  .describe('m', 'The mode to run the specified tool in')
  .choices('m', ['headless', 'junit', 'junit-headless', 'ci'])
  .argv;

console.log('my args', argv);

async function runBbcA11y({ argv }) {
  buildBbcA11y();

  const { mode } = argv;
  const runBbcA11y = mode === 'ci' ? runBbcA11yInCiMode : runBbcA11yOnHost;

  const bbcA11yExitCode = await runBbcA11y(argv);

  cleanBbcA11y();
  process.exit(bbcA11yExitCode);
}

function runLighthouse() {
  console.log('lighthouse');
}

function getBbcA11yArgs(mode) {
  switch (mode) {
    case 'headless':
      return [];
    case 'junit':
      return ['--interactive', '--reporter', './lib/bbcA11YJUnitReporter.js'];
    case 'junit-headless':
        ['--reporter', './lib/bbcA11YJUnitReporter.js']
    default:
      return ['--interactive']
  }
}

function runBbcA11yOnHost(argv) {
  return new Promise((resolve) => {
    const { mode } = argv;
    const bbcA11yArgs = getBbcA11yArgs(mode);
    const bbcA11y = spawn('bbc-a11y', [...bbcA11yArgs, ...argv._.slice(1)]);
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
