#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

function setPrivate(value) {
  pkg.private = value;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

if (process.env.SAFE_PUBLISH !== '1') {
  console.error('Direct publish blocked. Use "npm run safe:publish" instead.');
  process.exit(1);
}
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
let cleanedUp = false;

function restorePrivate() {
  if (cleanedUp) return;
  cleanedUp = true;
  try {
    setPrivate(true);
    console.log('Restored package.json private:true');
  } catch (e) {
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
  console.error(err);
  restorePrivate();
  process.exit(1);
});

try {
  setPrivate(false);
  execSync('npm run verify:release', { stdio: 'inherit' });
  execSync('npm publish --ignore-scripts=false', { stdio: 'inherit' });
  console.log('Safe publish complete.');
} catch (err) {
  process.exit(err.status || 1);
}