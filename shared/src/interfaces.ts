export type Headers = string[]

export type Rows = any[][]

export interface SpreadsheetData {
  headers: Headers
  rows: Rows
}

export interface RunTestsResult {
  error_messages: string[]
  successes: { testId: string }[]
}
