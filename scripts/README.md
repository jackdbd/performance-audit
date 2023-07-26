# Scripts

Retrieve field performance data of https://web.dev/ttfb/, for `PHONE` devices, using the [CrUX History API](https://developer.chrome.com/docs/crux/history-api/). Write the results to a CSV file.

```sh
npx tsm scripts/crux-history.ts \
  --url https://web.dev/ttfb/ \
  --form-factor PHONE
```

Retrieve origins that had a poor TTFB in Italy, in June 2023, for phone devices.

```sh
npx tsm scripts/crux-poor-ttfb.ts \
  --country-code IT \
  --form-factor PHONE \
  --yyyymm 202306
```

Retrieve origins that had a poor TTFB in Germany, in May 2023, for desktop devices.

```sh
npx tsm scripts/crux-poor-ttfb.ts \
  --country-code DE \
  --form-factor DESKTOP \
  --yyyymm 202305
```
