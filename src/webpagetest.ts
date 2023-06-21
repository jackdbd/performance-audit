import type { Param } from './utils'

/**
 * Creates a query string from a list of parameters.
 *
 * @param {Array.<{key: String, value: string | number | boolean}>} params key/value pairs of URL parameters.
 * @return {string} query string
 */
export const queryString = (params: Param[]) => {
  const arr = params.reduce((acc, cv) => {
    return acc.concat(`${cv.key}=${encodeURIComponent(cv.value)}`)
  }, [])

  arr.sort((a, b) => (a < b ? -1 : +1))

  return arr.join('&')
}

/**
 * Retrieves the WebPageTest API key from your Apps Script project settings.
 *
 * @return {string} Your WebPageTest API key.
 * @see {@link https://developers.google.com/apps-script/guides/properties Properties Service}
 */
export const GET_WEBPAGETEST_API_KEY = () => {
  return PropertiesService.getScriptProperties().getProperty(
    'WEBPAGETEST_API_KEY'
  )
}

/**
 * Retrieves all available test locations.
 *
 * @return {Object} All locations available in the WebPageTest public instance.
 * @see {@link https://docs.webpagetest.org/api/reference/#retrieving-available-locations WebPageTest available locations}
 * @customFunction
 */
export const GET_WEBPAGETEST_LOCATIONS = () => {
  const url = 'https://www.webpagetest.org/getLocations.php?f=json'
  const response = UrlFetchApp.fetch(url)
  const result = JSON.parse(response.getContentText())
  return JSON.stringify(result.data, null, 2)
}

/**
 * Retrieves the remaining test balance.
 *
 * @return {Object} The remaining WebPageTest test balance.
 * @see {@link https://docs.webpagetest.org/api/reference/#checking-remaining-test-balance WebPageTest test balance}
 * @customFunction
 */
export const GET_WEBPAGETEST_TEST_BALANCE = () => {
  const k = GET_WEBPAGETEST_API_KEY()
  const url = `https://www.webpagetest.org/testBalance.php?f=json&k=${k}`
  const response = UrlFetchApp.fetch(url)
  const result = JSON.parse(response.getContentText())
  return result.data.remaining
}

/**
 * Retrieves all available testers.
 *
 * @return {Object} All testers available in the WebPageTest public instance.
 * @customFunction
 */
export const GET_WEBPAGETEST_TESTERS = () => {
  const url = 'https://www.webpagetest.org/getTesters.php?f=json'
  const response = UrlFetchApp.fetch(url)
  const result = JSON.parse(response.getContentText())
  return JSON.stringify(result.data, null, 2)
}

type Cookies = { key: string; value: string }[]

/**
 * Generates a script for WebPageTest that sets cookies and navigates to a URL.
 *
 * @param {Array<{ key: string, value: string }>} cookies - An array of key-value pairs representing the cookies to be set.
 * @return {string} A script for WebPageTest that sets the cookies and navigates to a URL.
 *
 * @see {@link https://docs.webpagetest.org/scripting/ WebPageTest Scripting}
 */
export const wptScriptFromCookies = (cookies: Cookies) => {
  let lines = []
  lines.push('addHeader %TEST_ID%')
  cookies.forEach((c) => {
    lines.push(`setCookie %ORIGIN% ${c.key}=${c.value}`)
  })
  lines.push('navigate %URL%')
  return lines.join('\n')
}

type Profile = { key: string; value: string }[]

interface RunTestConfig {
  cookies: Cookies
  profile: Profile
  url: string
}

/**
 * Runs a WebPageTest audit using the parameters from Google Sheets.
 *
 * @see {@link https://docs.webpagetest.org/api/reference/#running-a-test Running a Test}
 */
export const runtest = ({ cookies, profile, url }: RunTestConfig) => {
  const params = [
    ...profile,
    { key: 'f', value: 'json' },
    { key: 'k', value: GET_WEBPAGETEST_API_KEY() },
    { key: 'script', value: wptScriptFromCookies(cookies) },
    { key: 'url', value: url }
  ]

  // https://developers.google.com/apps-script/reference/base/browser#msgboxprompt
  // Browser.msgBox(JSON.stringify(params, null, 2))

  const qs = queryString(params)

  const wpt_server = 'https://www.webpagetest.org'
  const endpoint = `${wpt_server}/runtest.php`

  const options = {
    method: 'post' as 'post',
    headers: {},
    payload: qs
  }
  const response = UrlFetchApp.fetch(endpoint, options)

  const result = JSON.parse(response.getContentText())
  return result.data
}

interface RunTestsConfig {
  array_of_cookies: Cookies[]
  profiles: Profile[]
  url: string
}

/**
 * Runs WebPageTest tests for a given set of cookies and profiles.
 *
 * @param {RunTestsConfig} array_of_cookies - an array of cookie strings to use for each test
 * @param {Array<Object>} profiles - an array of objects containing the profile parameters for each test
 * @param {string} url - the URL to test
 * @return {Array<Object>} An array of test results
 */
export const runtests = ({
  array_of_cookies,
  profiles,
  url
}: RunTestsConfig) => {
  let batch = []
  if (array_of_cookies.length === 0) {
    for (const profile of profiles) {
      batch.push({ cookies: [], profile, url })
    }
  } else {
    for (const cookies of array_of_cookies) {
      for (const profile of profiles) {
        batch.push({ cookies, profile, url })
      }
    }
  }

  let arr = []
  const ui = SpreadsheetApp.getUi()

  // https://developers.google.com/apps-script/guides/dialogs#alert_dialogs
  const result = ui.alert(
    'Please confirm',
    `The combination of parameters and cookies will result in ${batch.length} WebPageTest tests. Do you want to launch them?`,
    ui.ButtonSet.YES_NO
  )

  if (result == ui.Button.YES) {
    for (const obj of batch) {
      const res = runtest(obj)
      arr.push(res)
    }
  }
  // the user clicked "No" or X in the title bar.
  // ui.alert('No tests will be launched.')

  return arr
}
