# a11y-tests-web

[![Build Status](https://travis-ci.org/bbc/a11y-tests-web.svg)](https://travis-ci.org/bbc/a11y-tests-web)

Uses [bbc-a11y](https://github.com/bbc/bbc-a11y) and [Google Lighthouse](https://developers.google.com/web/tools/lighthouse/) to run a suite of automated tests to test accessibility across a set of webpages, defined in a config file.

## Requirements
- Node v6 or above
- libgconf-2-4
- Docker (if using the `ci` option)

## Installation of dependencies

```
npm install
```

## Usages

### Run bbc-a11y using a config, e.g. iplayer-web/all

To run bbc-a11y in interactive mode:

```
A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y
```

This will generate the commands for bbc-a11y and then run the tests against the pages listed in the iplayer-web/all config file in the config directory.

### Run bbc-a11y in headless mode

To run bbc-a11y in headless mode:

```
A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y:headless
```

### Run bbc-a11y and generate a JUnit report

To generate a JUnit report, you can tell bbc-a11y to use the JUnit reporter:

```
A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y:junit
```

### Run bbc-a11y and generate a JUnit report in headless mode

To generate a JUnit report in headless mode:

```
A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y:junit-headless
```

### Run bbc-a11y and generate a JUnit report using Docker

If you don't have all the necessary libraries on your system required to run Electron, for example if you want to run this on a CI server, or if you want the process to always exit successfully, you can run this command to run them inside a Docker container and exit with success (thanks to Joseph Wynn for [the container](https://hub.docker.com/r/wildlyinaccurate/bbc-a11y-docker/)):

```
A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y:ci
```

Note that Docker obviously needs to be running and you can ignore any messages about XLib and libudev.

### Run Google Lighthouse and generate a JUnit report using a config, e.g. iplayer-web/all

To run Google Lighthouse and generate a JUnit report:

```
A11Y_CONFIG=iplayer-web/all npm run start:lighthouse:junit
```

This will run the Google Lighthouse accessibility audit against the URLs defined in the iplayer-web/all config file, and generate a JUnit report called lighthouse-report.xml.

If you'd like a more human readable report, you can simply use Google Chrome to run the audit, by opening dev tools and going to Audits.

### Run Google Lighthouse in headless mode and generate a JUnit report

To run Google Lighthouse in headless mode and generate a JUnit report:

```
A11Y_CONFIG=iplayer-web/all npm run start:lighthouse:junit-headless
```

## Running on Jenkins

If you'd like to run this on your Jenkins server, ensure your Jenkins meets the requirements above and has a [JUnit plugin](https://plugins.jenkins.io/junit) installed and then:
- Create a Jenkins job
- Add this repo to the Jenkins job
- Get the job to run `npm i --production`
- Get the job to run the `start:bbc-a11y:ci` command for bbc-a11y or `start:lighthouse:junit-headless` for Lighthouse, with your `A11Y_CONFIG`
- Add a post-build action to "Publish JUnit test results report" (or such like). The bbc-a11y XML file is called "bbc-a11y-report.xml" and the Lighthouse XML file is called "lighthouse-report.xml".

## Creating a config

If your product/team does not already have a folder, create one in `config`.
You then need to create a new file in this folder which should either be a JSON file or a JS file that exports an object.

The data should include:
- `options` - Object - Options as defined by bbc-a11y, e.g. hide and skip. Note that these are currently **ignored** by Google Lighthouse.
- `baseUrl` - String - The domain to run the tests against, e.g. "https://www.bbc.co.uk"
- `paths` - Array - The paths on that domain to run the tests against
- `signedInPaths` - Array - An optional list of paths to run the tests against, after signing in to BBC ID.

Note that if you have a list of `signedInPaths`, the username and password to use when logging in to BBC ID should be specified using the environment variables A11Y_USERNAME and A11Y_PASSWORD.

## Contributing
See [CONTRIBUTING.md](https://github.com/bbc/a11y-tests-web/blob/master/CONTRIBUTING.md)
