# iPlayer Web Config

## Usage

As well as all the normal usage options, the iPlayer Web tests can be pointed at different `baseUrl`s using the `A11Y_IPLAYER_WEB_BASE_URL` environment variable. For example:


```
A11Y_CONFIG=iplayer-web/all A11Y_IPLAYER_WEB_BASE_URL=https://some.url npm run start:bbc-a11y
```

We can also provide the username and password to run against the signed in pages

For bbc-a11y
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_IPLAYER_WEB_BASE_URL=https://some.url A11Y_CONFIG=iplayer-web/all npm run start:bbc-a11y:headless
```

For lighthouse
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_IPLAYER_WEB_BASE_URL=https://some.url A11Y_CONFIG=iplayer-web/all npm run start:lighthouse:headless
```

We have also added a way to execute against particular page, the below example will run against iPlayer homepage:

For devs to bbc-a11y on localhost :
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_IPLAYER_WEB_BASE_URL=https://localhost.bbc.co.uk A11Y_CONFIG=iplayer-web/app-homepage-test npm run start:bbc-a11y:headless
```

For devs to lighthouse on localhost :
```
A11Y_USERNAME=user A11Y_PASSWORD=password A11Y_IPLAYER_WEB_BASE_URL=https://localhost.bbc.co.uk A11Y_CONFIG=iplayer-web/app-homepage-test npm run start:lighthouse:headless
```
