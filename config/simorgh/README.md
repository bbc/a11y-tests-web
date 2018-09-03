# Simorgh config

## Usage

Run bbc-a11y:

```
A11Y_CONFIG=simorgh/simorgh A11Y_SIMORGH_BASE_URL=http://localhost:7080 npm run start:bbc-a11y
```

Run lighthouse tests and save to OUTPUT_JSON path
```
A11Y_CONFIG=simorgh/simorgh OUTPUT_JSON='/../lighthouse-report.json' npm run start:lighthouse:junit 
```
