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
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://some.url A11Y_CONFIG=sounds-web/all npm run start:lighthouse:headless
```

We have also added a way to execute against particular page, the below example will run against Listen Page:

For bbc-a11y
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://www.bbc.co.uk A11Y_CONFIG=sounds-web/listen_page npm run start:bbc-a11y:headless
```

For lighthouse
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_SOUNDS_WEB_BASE_URL=https://www.bbc.co.uk A11Y_CONFIG=sounds-web/listen_page npm run start:lighthouse:headless
```
