# performance audit

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)
[![CI workflow](https://github.com/jackdbd/performance-audit/actions/workflows/ci.yaml/badge.svg)](https://github.com/jackdbd/performance-audit/actions/workflows/ci.yaml)

Google App Script [bound to a Google Sheets](https://developers.google.com/apps-script/guides/bound) optimized to bypass consent banners.

Inspired by [WebPageTest Google Sheets Bulk Tester](https://github.com/WebPageTest/WebPageTest-Bulk-Tester).

## How to use it?

TODO: copy the original Google Sheets, etc...

## Configuration

Copy your WebPageTest API key in the [Script Properties](https://developers.google.com/apps-script/guides/properties). Only those ones that have access to your Google Sheets will be able to view these properties. Properties are never shared between scripts.

![Key-Value pairs in Script Properties](./assets/images/script-properties.png)

## Installation

Install all the necessary dependencies to build, test, deploy this application.

```sh
npm install
```

## Test

Watch files and run tests in watch mode with [vitest](https://vitest.dev/):

```sh
npm run test
```

Run all tests and generate a coverage reports.

```sh
npm run coverage
```

## Deploy

Push changes to the Google Apps Script server.

```sh
npm run deploy
```

> :information_source: I prefer to deploy this script manually, because deploying it automatically from the CI workflow would require to store the `.clasprc.json` credentials in a GitHub secret.

You can double-check which files will be pushed to Apps Script using this command.

```sh
npx clasp status
```

Open the project on `script.google.com`.

```sh
npx clasp open
```

## Other

- Apps Script Manifest (i.e. `appsscript.json`): see [here](https://developers.google.com/apps-script/concepts/manifests) and [here](https://developers.google.com/apps-script/manifest).
- Project Settings File (i.e. `.clasp.json`): see [here](https://github.com/google/clasp#project-settings-file-claspjson).
- OAuth scopes: see [here](https://developers.google.com/apps-script/add-ons/concepts/workspace-scopes) and [here](https://developers.google.com/apps-script/add-ons/concepts/editor-scopes).
- Invoke an Apps Script function remotely: see [here](https://github.com/google/clasp/blob/master/docs/run.md).
