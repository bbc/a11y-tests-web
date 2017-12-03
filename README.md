# a11y-tests-web

Uses [bbc-a11y](https://github.com/bbc/bbc-a11y) and [Google Lighthouse](https://developers.google.com/web/tools/lighthouse/) to run a suite of automated tests to test accessibility across a set of webpages, defined in a config file.

## Requirements
- Node v6 or above
- Docker (if using the `ci` option)

## Installation

```
npm install
```

## Usages

### Run bbc-a11y using a config, e.g. iplayer-web/all

To run bbc-a11y in interactive mode:

```
A11Y_CONFIG=iplayer-web/all npm start:bbc-a11y
```

This will generate the commands for bbc-a11y and then run the tests against the pages listed in the iplayer-web/all config file in config/bbc-a11y

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

If you don't have all the necessary libraries on your system required to run Electron, for example if you want to run this on a CI server, you can run the bbc-a11y tests inside a Docker container (thanks to Joseph Wynn for [the container](https://hub.docker.com/r/wildlyinaccurate/bbc-a11y-docker/)):

```
A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y:ci
```

## Running on Jenkins

If you'd like to run this on your Jenkins server, ensure your Jenkins meets the requirements above and has the [JUnit plugin](https://plugins.jenkins.io/junit) installed and then:
- Create a Jenkins job
- Add this repo to the Jenkins job
- Get the job to run `npm i --production`
- Get the job to run the `start:bbc-a11y:ci` command as outlined above with your `A11Y_CONFIG`
- Add a post-build action to "Publish JUnit test results report". The XML file is called "bbc-a11y-report.xml".

## Creating a config

### bbc-a11y

Create a new file in config/bbc-a11y. It should either be a JSON file or a JS file that exports an object.

The data should include:
- `options` - Object - Options as defined by bbc-a11y, e.g. hide and skip
- `baseUrl` - String - The domain to run the tests against, e.g. "https://www.bbc.co.uk"
- `paths` - Array - The paths on that domain to run the tests against
- `signedInPaths` - Array - An optional list of paths to run the tests against, after signing in to BBC ID.

Note that if you have a list of `signedInPaths`, the username and password to use when logging in to BBC ID should be specified using the environment variables A11Y_USERNAME and A11Y_PASSWORD.

## Contributing
If you'd like to add your own config for your team, or contribute to this repo in some other way...
- Create a fork
- Create a branch
- Make your changes
- Ensure the linting job (`npm run lint`) runs successfully (and fix any issues if not)
- Submit a PR
