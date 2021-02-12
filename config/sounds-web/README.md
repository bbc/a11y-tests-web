# BBC Sounds Web Config

## Usage

As well as all the normal usage options, the BBC Sounds Web tests can be pointed at different `baseUrl`s using the `A11Y_SOUNDS_WEB_BASE_URL` environment variable. For example:


```
A11Y_SOUNDS_WEB_BASE_URL=https://some.url A11Y_CONFIG=sounds-web/all npm run start:bbc-a11y:headless
```

We can also provide the username and password to run against the signed in pages

For bbc-a11y
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://some.url A11Y_CONFIG=sounds-web/all npm run start:bbc-a11y:headless
```

For lighthouse
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://some.url A11Y_CONFIG=sounds-web/all npm run start:lighthouse:junit-headless
```

We have also added a way to execute against particular page, the below example will run against Listen Page:

For devs to run bbc-a11y on localhost :
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://localhost.bbc.co.uk A11Y_CONFIG=sounds-web/listen_page npm run start:bbc-a11y:headless
```

For devs to run lighthouse on localhost :
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://localhost.bbc.co.uk A11Y_CONFIG=sounds-web/listen_page npm run start:lighthouse:junit-headless
```
### Single Web page

To test a single webpage (while also including the Sounds Web specific settings), run using the 'url' config, replacing the url with your own:
```
A11Y_URL='http://www.google.com' A11Y_CONFIG=sounds-web/url a11y-tests-web bbc-a11y -m headless
```

