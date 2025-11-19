#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function setPrivate(value) {
  pkg.private = value;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

if (process.env.PUBLISH_SAFE !== '1') {
  // eslint-disable-next-line no-console
  console.error('Direct publish blocked. Use "npm run publish:safe" instead.');
  process.exit(1);
}

let cleanedUp = false;

function restorePrivate() {
  if (cleanedUp) return;
  cleanedUp = true;
  try {
    setPrivate(true);
    // eslint-disable-next-line no-console
    console.log('Restored package.json private:true');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to restore package.json private:true', e);
  }
}

process.on('exit', restorePrivate);
process.on('SIGINT', () => {
  restorePrivate();
  process.exit(1);
});
process.on('SIGTERM', () => {
  restorePrivate();
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  restorePrivate();
  process.exit(1);
});

try {
  setPrivate(false);
  execSync('npm run verify:release', { stdio: 'inherit' });
  execSync('npm publish --ignore-scripts=false', { stdio: 'inherit' });
  // eslint-disable-next-line no-console
  console.log('Publish safe complete.');
} catch (err) {
  process.exit(err.status || 1);
}
