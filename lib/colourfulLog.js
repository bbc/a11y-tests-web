'use strict';

const ICONS = {
  ok: '\x1b[32m✔\x1b[0m',
  error: '\x1b[31m✘\x1b[0m',
  warning: '\x1b[33m!\x1b[0m'
};

const COLOURS = {
  log: '\x1b[2m',
  ok: '\x1b[2m',
  warning: '\x1b[33m',
  error: '\x1b[31m'
};

function getIcon(type) {
  return ICONS[type] ? ICONS[type] + ' ' : '';
}

function getMessage(text, type) {
  const color = COLOURS[type] ? COLOURS[type] : '';
  return `${color}${text}\x1b[0m\n`
}

function output(text, type) {
  process.stdout.write(`${getIcon(type)}${getMessage(text, type)}`);
}

module.exports = {
  log: (text) => output(text),
  ok: (text) => output(text, 'ok'),
  warning: (text) => output(text, 'warning'),
  error: (text) => output(text, 'error')
};
