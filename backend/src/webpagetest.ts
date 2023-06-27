import { logJSON } from './utils'
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
 * @customFunction
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

interface WptScriptConfig {
  header?: string
  body?: string
  footer?: string
}

/**
 * Generates a script for WebPageTest.
 *
 * @param {Object} config A configuration object.
 * @return {string} A script for WebPageTest that sets the cookies and navigates to a URL.
 *
 * @see {@link https://docs.webpagetest.org/scripting/ WebPageTest Scripting}
 * @see {@link https://simonhearne.com/2020/testing-behind-consent/ Measuring Performance behind consent popups}
 */
export const wptScript = (config: WptScriptConfig) => {
  const header = config.header || ''
  const body = config.body || ''
  const footer = config.footer || ''

  return [header, body, footer].join('\n')
}

type Profile = { key: string; value: string }[]

interface RunTestConfig {
  cookies: Cookies
  inject_script?: string
  profile: Profile
  url: string
  wpt_script?: string
}

/**
 * Runs a WebPageTest audit using the parameters from Google Sheets.
 *
 * @see {@link https://docs.webpagetest.org/api/reference/#running-a-test Running a Test}
 * @customFunction
 */
export const runtest = ({
  cookies,
  inject_script,
  profile,
  url,
  wpt_script
}: RunTestConfig) => {
  const script = wpt_script

  logJSON({
    message: `WPT runtest parameters (see JSON payload)`,
    tags: ['webpagetest'],
    ...profile,
    inject_script,
    script,
    url
  })

  const params = [
    ...profile,
    { key: 'f', value: 'json' },
    { key: 'url', value: url }
  ]
  const k = GET_WEBPAGETEST_API_KEY()
  if (k) {
    params.push({ key: 'k', value: k })
  }
  if (inject_script) {
    params.push({ key: 'injectScript', value: inject_script })
  }
  if (script) {
    params.push({ key: 'script', value: script })
  }

  // https://developers.google.com/apps-script/reference/base/browser#msgboxtitle,-prompt,-buttons
  // Browser.msgBox('WPT script', script, Browser.Buttons.OK)
  // Browser.msgBox(
  //   'WPT /runtest parameters',
  //   JSON.stringify(params, null, 2),
  //   Browser.Buttons.OK
  // )

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

  if (result.statusCode === 200) {
    return { value: result.data }
  } else {
    const text = result.statusText || 'Unknown error'
    const code = result.statusCode || 'Unknown status code'
    Logger.log(`[${code}]: ${text}`)
    return { error: new Error(`[${code}]: ${text}`) }
  }
}

interface RunTestsConfig {
  array_of_cookies: Cookies[]
  inject_script?: string
  profiles: Profile[]
  script_lines: string[]
  url: string
}

/**
 * Runs WebPageTest tests for a given set of cookies and profiles.
 *
 * @param {RunTestsConfig} array_of_cookies - an array of cookie strings to use for each test
 * @param {(string | undefined)} inject_script - an optional JS script to inject into the page
 * @param {Array<Object>} profiles - an array of objects containing the profile parameters for each test
 * @param {string} url - the URL to test
 * @param {(string | undefined)} wpt_script - an optional WPT script
 * @return {Array<Object>} An array of test results
 * @customFunction
 */
export const runtests = ({
  array_of_cookies,
  inject_script,
  profiles,
  script_lines,
  url
}: RunTestsConfig) => {
  const wpt_script = script_lines.join('\n')

  // const id_consent_button = 'pt-accept-all'
  // TODO: I tried to take the WPT script from the frontend, but SOMETIMES it
  // doesn't work. It SEEMS that using %URL% makes the navigation fail.
  // const wpt_script = [
  //   `addHeader %TEST_ID%`,
  //   `setEventName navigate_and_wait_for_consent_banner`,
  //   `navigate ${url}`,
  //   `waitFor document.getElementById('${id_consent_button}')`,
  //   `setEventName click_accept_cookies`,
  //   `execAndWait document.querySelector('#${id_consent_button}').click()`
  // ].join('\n')

  let batch = []
  if (array_of_cookies.length === 0) {
    for (const profile of profiles) {
      batch.push({ cookies: [], inject_script, profile, url, wpt_script })
    }
  } else {
    for (const cookies of array_of_cookies) {
      Logger.log(`set cookies for URL ${url}`)
      Logger.log(JSON.stringify(cookies, null, 2))
      for (const profile of profiles) {
        batch.push({ cookies, inject_script, profile, url, wpt_script })
      }
    }
  }

  const successes = []
  // We cannot return Error objects to the frontend. We would need to serialize
  // them, and this might not worth the performance cost. Better simply return
  // the error messages as strings.
  // https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
  // https://betterprogramming.pub/serializing-error-in-javascript-27c3a048dc3b
  const error_messages = []

  const ui = SpreadsheetApp.getUi()

  // https://developers.google.com/apps-script/guides/dialogs#alert_dialogs
  const result = ui.alert(
    'Please confirm',
    `The combination of parameters and cookies will result in ${batch.length} WebPageTest tests. Do you want to launch them?`,
    ui.ButtonSet.YES_NO
  )

  if (result == ui.Button.YES) {
    for (const obj of batch) {
      // I don't know why logs inside runtest do not show up. So I log them here.
      const payload = JSON.stringify(obj, null, 2)
      Logger.log({
        message: `WPT runtest parameters (see payload): ${payload}`
      })
      const res = runtest(obj)

      if (res.error) {
        console.error(
          `could not launch WPT test for URL ${obj.url}. error: ${res.error.message}`
        )
        error_messages.push(res.error.message)
      }
      if (res.value) {
        Logger.log(
          `launched WPT test for URL ${obj.url}. testId: ${res.value.testId}`
        )
        successes.push(res.value)
      }
    }
  }

  // the user clicked "No" or X in the title bar.
  // ui.alert('No tests will be launched.')

  // This function tries to launch N WPT tests. Throwing an exception if even
  // just one of the test failed to run seems unreasonable. I think it's better
  // to return a result object containing a recap of all failed/successful
  // operations.
  // if (errors.length > 0) {
  //   const summary = `${errors.length} errors when launching the WPT tests`
  //   const details = errors.map((e) => e.message)
  //   throw new Error(`${summary}.\n${details.join('\n')}`)
  // }

  return { error_messages, successes }
}
