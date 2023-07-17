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

export interface CruxBigQueryOptions {
  maximum_bytes_billed?: number
  months?: number[]
  query_timeout_ms?: number
  url?: string
}

export interface CruxHistoryAPIOptions {
  form_factor?: string
  url?: string
}
