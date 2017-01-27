# tviplayer-a11y-tests

Uses [bbc-a11y](https://github.com/bbc/bbc-a11y) to run a suite of automated tests to test accessibility across the iPlayer website.

## Installation

```
npm install
```

## Usages

### Run against live

```
npm start
```

This will generate the commands for bbc-a11y and then run the tests against the pages listed in paths.txt against http://www.bbc.co.uk.

### Run against a different environment

If you want to run against a different environment, you can set the environment variable `A11Y_BASE_URL`, e.g.:

```
A11Y_BASE_URL=http://www.test.bbc.co.uk npm start
```

### Run in interactive mode

To explore the test errors, you can run bbc-a11y in interactive mode:

```
npm run start:interactive
```
