export const DEFAULT_CONFIG = {
  inject_script: `console.log('Hello World!')`,
  script_lines: [
    `navigate %URL%`,
    `execAndWait document.querySelector('#accept-cookies').click()`
  ]
}

export const SELECTOR = {
  APP: '#app',
  FORM: 'form[name="Audit"]',
  INJECT_SCRIPT: '#inject-script',
  URL_TO_AUDIT: '#url-to-audit',
  WPT_SCRIPT: '#wpt-script'
}
