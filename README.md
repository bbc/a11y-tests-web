# iplayer-web-a11y-tests

Uses [bbc-a11y](https://github.com/bbc/bbc-a11y) to run a suite of automated tests to test accessibility across a set of webpages.

## Installation

```
npm install
```

## Usages

### e.g. Run bbc-a11y using the iPlayer Web config

```
BBC_A11Y_CONFIG=iplayer-web-all npm start:bbc-a11y
```

This will generate the commands for bbc-a11y and then run the tests against the pages listed in the iplayer-web-all config file in config/bbc-a11y

### Run in interactive mode

To explore the test errors, you can run bbc-a11y in interactive mode:

```
BBC_A11Y_CONFIG=iplayer-web-all npm run start:bbc-a11y:interactive
```

### Generate a JUnit report

To generate a JUnit report, you can tell bbc-a11y to use the JUnit reporter:

```
BBC_A11Y_CONFIG=iplayer-web-all npm run start:bbc-a11y:junit
```

### Generate a JUnit report using Docker

If you don't have all the necessary libraries on your system required to run Electron, for example if you want to run this on a CI server, you can run the bbc-a11y tests inside a Docker container (thanks to Joseph Wynn for [the container](https://hub.docker.com/r/wildlyinaccurate/bbc-a11y-docker/)):

```
BBC_A11Y_CONFIG=iplayer-web-all npm run start:bbc-a11y:ci
```
