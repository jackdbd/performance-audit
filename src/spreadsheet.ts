import { SHEET_NAME } from './constants'
import { cookiesFromMatrix, runtestParamsFromMatrix } from './utils'

export interface DisplayConfig {
  message: string
  title: string
  timeOutSeconds: number
}

export const displayStatusMessage = ({
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

  const message = `Extracting headers and values from sheet '${name}'`
  Logger.log(message)
  // spreadsheet.toast(message, 'Status', 5)

  // In Google Sheets, row/column indexes start at 1
  // -1 because the first row is for the headers
  const num_rows = sheet.getLastRow() - 1
  const num_columns = sheet.getLastColumn()

  const headers = sheet.getRange(1, 1, 1, num_columns).getValues()[0]
  const range = sheet.getRange(2, 1, num_rows, num_columns)

  return { headers, rows: range.getValues() }
}

export const GET_WPT_RUNTEST_CELLS = () => {
  const { headers, rows } = headersAndRows(SHEET_NAME.WPT_RUNTEST_PARAMS)
  return { headers, matrix: rows }
}

export const GET_COOKIES_CELLS = () => {
  const { headers, rows } = headersAndRows(SHEET_NAME.COOKIES)
  return { headers, matrix: rows }
}

export const getCookies = (google_sheets_row_indexes: number[]) => {
  const { headers, rows } = headersAndRows(SHEET_NAME.COOKIES)
  // +2 because of headers and indexing that starts at 1 in Google Sheets
  const matrix = rows.filter((_row, i) =>
    google_sheets_row_indexes.includes(i + 2)
  )

  return cookiesFromMatrix({ headers, matrix })
}

export const getAllCookies = () => {
  const { headers, rows } = headersAndRows(SHEET_NAME.COOKIES)
  // exclude the first row, which is the headers
  // const matrix = rows.filter((_row, i) => i !== 0)
  return cookiesFromMatrix({ headers, matrix: rows })
}

export const getWebPageTestProfiles = (google_sheets_row_indexes: number[]) => {
  const { headers, rows } = headersAndRows(SHEET_NAME.WPT_RUNTEST_PARAMS)

  // +2 because of headers and indexing that starts at 1 in Google Sheets
  const matrix = rows.filter((_row, i) =>
    google_sheets_row_indexes.includes(i + 2)
  )

  return runtestParamsFromMatrix({ headers, matrix })
}
