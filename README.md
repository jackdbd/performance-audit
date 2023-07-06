# Performance Audit

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)
[![CI workflow](https://github.com/jackdbd/performance-audit/actions/workflows/ci.yaml/badge.svg)](https://github.com/jackdbd/performance-audit/actions/workflows/ci.yaml)

Retrieve field performance data from the [CrUX BigQuery dataset](https://developer.chrome.com/docs/crux/bigquery/) and launch [WebPageTest](https://docs.webpagetest.org/api/reference/) tests without leaving Google Sheets.

> :information_source: Read [this article](https://web.dev/lab-and-field-data-differences/) to understand the difference between field data and lab data.

## How to use it?

<!-- markdownlint-disable MD033 -->
<figure>
  <video width="640" height="480" autoplay loop controls>
    <source
      type="video/mp4"
      src="https://github.com/jackdbd/performance-audit/raw/main/assets/videos/demo-first-visit-with-subs.mp4">
    Your browser does not support HTML5 video tag.
  </video>
  <figcaption>First visit</figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<figure>
  <video width="640" height="480" autoplay loop controls>
    <source
      type="video/mp4"
      src="https://github.com/jackdbd/performance-audit/raw/main/assets/videos/demo-second-visit-with-subs.mp4">
    Your browser does not support HTML5 video tag.
  </video>
  <figcaption>Repeat visit</figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

This is a [Google Apps Script](https://developers.google.com/apps-script) project bound to a Google Sheets spreadsheet. [Bound scripts](https://developers.google.com/apps-script/guides/bound) are effectively unpublished Apps Script Editor add-on that function only for the file they are bound to.

If you want to use this tool, you just need to create a copy of [this spreadsheet](https://docs.google.com/spreadsheets/d/12Z3HBsRuuJp8yXTa9uaK2CzY6so_uIOrRGa8kaq8ZPk/) by clicking on `File` > `Make a copy`.

If you want to modify the Apps Script project tied to the spreadsheet, you essentially have two options:

1. Without using [clasp](https://github.com/google/clasp): make a copy of the spreadsheet, the edit the code directly in Google Sheets, in `Extensions` > `Apps Script`.
2. Using clasp: clone this repository, replace `scriptId` and `projectId` in the `.clasp.json` file with your own values, develop the project as any other software project (commit changes in source control, push to remote repo, deploy, etc).

## Configuration

Copy your WebPageTest API key in the [Script Properties](https://developers.google.com/apps-script/guides/properties). Only those ones that have access to your Google Sheets will be able to view these properties. Properties are never shared between scripts.

![Key-Value pairs in Script Properties](./assets/images/script-properties.png)

## Installation

Install all the necessary dependencies to build, test, deploy this project.

```sh
npm install
```

## Test

Run tests in watch mode with [vitest](https://vitest.dev/).

```sh
npm run test
```

Run all tests once and generate a coverage reports.

```sh
npm run test:coverage
```

## Development

This project consists of some backend code and frontend components.

In production, the backend code runs on the Apps Script servers, which host a [V8-based runtime](https://developers.google.com/apps-script/guides/v8-runtime) somewhat similar to Node.js. Each frontend component is executed in an `<iframe>` for [security reasons](https://developers.google.com/apps-script/guides/html/restrictions).

In development, the backend code runs on Node.js. Each frontend component is a standalone web app that can be run on a different port. This make developing each frontend component easy using [vite](https://vitejs.dev/guide/).

Run a vite dev server for each of the frontend components.

```sh
npm run dev
```

Each frontend component will be served as a standalone web app on a different port (e.g. 5173, 5174).

clasp will take care of transpiling TypeScript code into Google Apps Script code [when you push it](https://developers.google.com/apps-script/guides/typescript), so you don't have to worry about that.

## Deploy

Push changes to the Google Apps Script server. The code pushed will be the [head deployment](https://developers.google.com/apps-script/concepts/deployments#head_deployments) of this [container-bound Apps Script](https://developers.google.com/apps-script/guides/bound) project.

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

## Reference

- Apps Script Manifest (i.e. `appsscript.json`): see [here](https://developers.google.com/apps-script/concepts/manifests) and [here](https://developers.google.com/apps-script/manifest).
- Project Settings File (i.e. `.clasp.json`): see [here](https://github.com/google/clasp#project-settings-file-claspjson).
- OAuth scopes: see [here](https://developers.google.com/apps-script/add-ons/concepts/workspace-scopes) and [here](https://developers.google.com/apps-script/add-ons/concepts/editor-scopes).
- Invoke an Apps Script function remotely: see [here](https://github.com/google/clasp/blob/master/docs/run.md).

CrUX datasets by Google are licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

## Credits

Inspired by [WebPageTest Google Sheets Bulk Tester](https://github.com/WebPageTest/WebPageTest-Bulk-Tester).