import { cookiesFromMatrix } from './cookie'
import { GET_COOKIES_CELLS, GET_WPT_RUNTEST_CELLS } from './spreadsheet'
import { runtestParamsFromMatrix } from './utils'
import type { Param } from './utils'

/**
 * Creates a query string from a list of parameters.
 *
 * @param {Array.<{key: String, value: string | number | boolean}>} params key/value pairs of URL parameters.
 * @return {string} query string
 * @customFunction
 */
export const QUERY_STRING = (params: Param[]) => {
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

const _LOG_WPT_API_KEY = () => {
  const s = GET_WEBPAGETEST_API_KEY()
  Logger.log(s)
}

/**
 * Retrieves all test locations.
 *
 * @return {Object} All locations available in the WebPageTest public instance.
 * @see {@link https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app}
 * @customFunction
 */
export const GET_WEBPAGETEST_LOCATIONS = () => {
  const url = 'https://www.webpagetest.org/getLocations.php?f=json'

  const options = {
    method: 'get' as 'get'
  }

  const response = UrlFetchApp.fetch(url, options)
  const result = JSON.parse(response.getContentText())
  // return result.data
  return JSON.stringify(result.data, null, 2)
}

interface Datum {
  url: string
  cookies: { key: string; value: string }[]
}

export const wptScriptsFromCookies = (arr: Datum[]) => {
  const scripts = arr.reduce((acc, cv) => {
    let lines = []
    cv.cookies.forEach((c) => {
      lines.push(`setCookie %ORIGIN% ${c.key}=${c.value}`)
    })
    lines.push('navigate %URL%')

    const script = lines.join('\n')
    return [...acc, script]
  }, [])

  return scripts
}

/**
 * Runs a WebPageTest audit using the parameters from Google Sheets.
 *
 * @see {@link https://docs.webpagetest.org/api/reference/#running-a-test Running a Test}
 * @customFunction
 */
export const RUN_WEBPAGETEST = (url: string) => {
  const params_cells = GET_WPT_RUNTEST_CELLS()
  const matrix_params = runtestParamsFromMatrix(params_cells)

  const cookies_cells = GET_COOKIES_CELLS()
  const arr = cookiesFromMatrix(cookies_cells)
  const scripts = wptScriptsFromCookies(arr)

  const k = GET_WEBPAGETEST_API_KEY()

  // TODO: N params rows, not just the first one. And N WPT scripts using the
  // cookies set on this URL
  const params = [
    ...matrix_params[0],
    { key: 'k', value: k },
    { key: 'script', value: scripts[0] },
    { key: 'url', value: url }
  ]

  const qs = QUERY_STRING(params)

  const wpt_server = 'https://www.webpagetest.org'
  const endpoint = `${wpt_server}/runtest.php`
  Logger.log(`run WPT test with query string: ${qs}`)

  const options = {
    method: 'post' as 'post',
    payload: qs
  }

  const response = UrlFetchApp.fetch(endpoint, options)

  // A POST to /runtest.php does not return a JSON, but HTML.
  const response_headers = response.getHeaders()
  // Among the HTTP response headers, we only care about Link, namely where to
  // find the WebPageTest result when it will be ready.
  let link = response_headers['Link']
  link = link.replace('<', '')
  link = link.replace('/>; rel="canonical"', '')

  const message = `WebPageTest result will be available at this link: ${link}`
  Logger.log(message)

  // https://developers.google.com/apps-script/reference/base/browser
  Browser.msgBox('Test submitted to WebPageTest', message, Browser.Buttons.OK)

  return link
}

const _LOG_RUN_WEBPAGETEST = () => {
  const url = 'https://www.iltirreno.it/'
  RUN_WEBPAGETEST(url)
}
