# Simorgh config

## Usage

Run bbc-a11y:

```
ATW_CONFIG=simorgh/simorgh ATW_SIMORGH_BASE_URL=http://localhost:7080 npm run start:bbc-a11y
```

Run lighthouse tests and save to ATW_OUTPUT_JSON path

```
ATW_CONFIG=simorgh/simorgh ATW_OUTPUT_JSON='/../lighthouse-report.json' npm run start:lighthouse:junit
```
