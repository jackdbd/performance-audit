import type { SpreadsheetData } from '../../shared/src/interfaces'
import { PREFIX, SHEET_NAME } from '../../shared/src/constants'
import { onError } from '../../shared/src/utils'
import { url_signal, wpt_profiles_signal } from './state'
import { FAKE_WPT_PARAMS_HEADERS, fakeWptParamsRows } from './utils'
import type { Param } from './webpagetest'

export const subscribeStateToGoogleSheetsDev = () => {
  if (!import.meta.env.DEV) {
    throw new Error(`this function should be called only in development`)
  }

  const ms_edit_url = 5000
  const ms_edit_wpt_profiles = 10000

  const userEditedUrl = () => {
    console.log(
      `${PREFIX}simulated edit in Google Sheets - user edits url every ${ms_edit_url}ms`
    )

    const n = Math.floor(Math.random() * 10)
    let url
    if (n > 7) {
      url = 'https://www.iltirreno.it/firenze/cronaca'
    } else if (n > 5) {
      url = 'https://www.lanazione.it/economia'
    } else if (n > 3) {
      url = 'https://www.maisonsdumonde.com/FR/fr/e/conseil-relooking-deco'
    } else if (n > 1) {
      url = 'https://www.vino.com/selezione/franciacorta'
    } else {
      url = undefined
    }

    url_signal.value = url
  }

  const userEditeWptProfiles = () => {
    console.log(
      `${PREFIX}simulated edit in Google Sheets - user edits wpt_profiles every ${ms_edit_wpt_profiles}ms`
    )

    const wpt_profiles = dataToWptProfiles({
      headers: FAKE_WPT_PARAMS_HEADERS,
      rows: fakeWptParamsRows()
    })

    wpt_profiles_signal.value = wpt_profiles
  }

  const id_edit_url = setInterval(userEditedUrl, ms_edit_url)

  const id_edit_wpt_profiles = setInterval(
    userEditeWptProfiles,
    ms_edit_wpt_profiles
  )

  return [id_edit_url, id_edit_wpt_profiles]
}

export const retrieveSpreadsheetData = () => {
  console.log(
    `${PREFIX}retrieve spreadsheet ${SHEET_NAME.WPT_RUNTEST_PARAMS} from Apps Script server`
  )
  google.script.run
    .withFailureHandler(onError)
    .withSuccessHandler(onGotHeadersAndRows)
    .headersAndRows(SHEET_NAME.WPT_RUNTEST_PARAMS)
}

export const subscribeStateToGoogleSheetsProd = () => {
  if (!import.meta.env.PROD) {
    throw new Error(`this function should be called only in production`)
  }

  const ms = 5000
  console.log(`${PREFIX}poll Apps Script server for data (every ${ms}ms)`)
  const id_poll = setInterval(retrieveSpreadsheetData, ms)
  return [id_poll]
}

/**
 * Subscribes the client-side app'state to the server-side state changes.
 *
 * The server-side state changes are:
 * - fake changes in development
 * - real changes to the Google Sheets in production
 */
export const subscribeStateToGoogleSheets = () => {
  if (import.meta.env.DEV) {
    return subscribeStateToGoogleSheetsDev()
  } else {
    return subscribeStateToGoogleSheetsProd()
  }
}

/**
 * Got headers and rows of a spreadsheet from the Apps Script server.
 */
function onGotHeadersAndRows(data: SpreadsheetData) {
  wpt_profiles_signal.value = dataToWptProfiles(data)
}

/**
 * Creates a matrix of parameters for the WebPageTest /runtest endpoint.
 */
export const runtestParams = ({ headers, rows }: SpreadsheetData) => {
  const matrix_params = rows.reduce((acc, row) => {
    const params = row
      .map((val, i) => {
        const value = val !== '' ? val : undefined
        return { key: headers[i], value }
      })
      .filter((p) => p.value)
    return acc.concat([params])
  }, [])

  return matrix_params as Param[][]
}

export const unsubscribeStateFromGoogleSheets = (interval_ids: string[]) => {
  console.log(`${PREFIX}unsubscribe state from Google Sheets`)
  interval_ids.forEach((id) => clearInterval(id))
}

export const dataToWptProfiles = (data: SpreadsheetData) => {
  const { headers, rows } = data
  const arr_of_params = runtestParams({ headers, rows })

  const wpt_profiles = arr_of_params.map((params, i) => {
    // +1 because indexes in Google Sheets start at 1, +1 for the headers
    const i_row = i + 2

    return {
      params,
      checked: false,
      id: `wpt-profile-${i}`,
      name: `Row ${i_row}`,
      'row-index': i_row
    }
  })

  return wpt_profiles
}
