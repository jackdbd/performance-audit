import { SHEET_NAME } from './constants'
import { cookiesFromMatrix, logJSON, runtestParamsFromMatrix } from './utils'

export interface DisplayConfig {
  message: string
  title: string
  timeOutSeconds: number
}

export const displayToast = ({
  message,
  title = 'Status',
  timeOutSeconds = 5
}: DisplayConfig) => {
  const spreadsheet = SpreadsheetApp.getActive()
  spreadsheet.toast(message, title, timeOutSeconds)
}

export const headersAndRows = (name: string) => {
  const spreadsheet = SpreadsheetApp.getActive()
  const sheet = spreadsheet.getSheetByName(name)

  // In Google Sheets, row/column indexes start at 1
  // -1 because the first row is for the headers
  const num_rows = sheet.getLastRow() - 1
  const num_columns = sheet.getLastColumn()

  const headers = sheet.getRange(1, 1, 1, num_columns).getValues()[0]
  const range = sheet.getRange(2, 1, num_rows, num_columns)
  const rows = range.getValues()

  const message = `Extracted headers and values from sheet '${name}'`
  logJSON({ message, headers, rows, tags: ['google-sheets'] })

  return { headers, rows }
}

/**
 * Extracts all cookies profiles from the spreadsheet.
 *
 * @customFunction
 */
export const getAllCookies = () => {
  const { headers, rows } = headersAndRows(SHEET_NAME.COOKIES)
  return cookiesFromMatrix({ headers, matrix: rows })
}

/**
 * Extracts all WebPageTest profiles from the spreadsheet.
 *
 * @customFunction
 */
export const getWebPageTestProfiles = (google_sheets_row_indexes: number[]) => {
  const { headers, rows } = headersAndRows(SHEET_NAME.WPT_RUNTEST_PARAMS)

  // +2 because of headers and indexing that starts at 1 in Google Sheets
  const matrix = rows.filter((_row, i) =>
    google_sheets_row_indexes.includes(i + 2)
  )

  return runtestParamsFromMatrix({ headers, matrix })
}
