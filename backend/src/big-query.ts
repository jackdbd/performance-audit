import {
  CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY,
  CRUX_QUERY_POOR_TTFB,
  DEFAULT,
  GCP_PROJECT_ID
} from '../../shared/src/constants'
import { getPreviousNMonths } from '../../shared/src/utils'
import {
  CruxBigQueryOptions,
  CruxBigQueryPoorTTFBOptions
} from '../../shared/src/interfaces'
import { logJSON } from './utils'

/**
 * Runs a parameterized query on the BigQuery CrUX dataset and writes the
 * results into a new sheet in the active spreadsheet.
 *
 * @param {Object} options Configuration for the query.
 * @return {Object} Recap of the operation.
 * @customFunction
 * @see {@link https://cloud.google.com/bigquery/docs/reference/rest/v2/Job BigQuery Job}
 * @see {@link https://developers.google.com/identity/protocols/oauth2/scopes#bigquery BigQuery API v2 OAuth scopes}
 */
function runQueryOnCrux(options: CruxBigQueryOptions = {}) {
  logJSON({
    message:
      'run Query on CrUX using these options (see JSON payload in Cloud Logging)',
    tags: ['bigquery', 'crux'],
    options
  })

  // Each queryParameters[] parameterValue's `value` MUST be a string
  // The BigQuery API will cast it to the queryParameters[] parameterType's type
  const url = options.url || DEFAULT.URL
  const months = options.months || getPreviousNMonths(3).map(parseInt)
  const query_timeout_ms = options.query_timeout_ms || DEFAULT.QUERY_TIMEOUT_MS
  // Set maximumBytesBilled to control the costs and avoid unexpected billing charges
  // https://cloud.google.com/bigquery/docs/best-practices-costs#limit_query_costs_by_restricting_the_number_of_bytes_billed
  const maximumBytesBilled =
    options.maximum_bytes_billed || DEFAULT.MAXIMUM_BYTES_BILLED

  const arr_values_months = months.map((value) => {
    return { value: value as any }
  })

  const request = {
    // dryRun: true,
    dryRun: false,
    maximumBytesBilled,
    parameterMode: 'NAMED',
    // https://cloud.google.com/bigquery/docs/reference/rest/v2/QueryParameter
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#data_type_sizes
    queryParameters: [
      {
        name: 'url',
        parameterType: { type: 'STRING' },
        parameterValue: { value: url }
      },
      {
        name: 'months',
        parameterType: { type: 'ARRAY', arrayType: { type: 'INT64' } },
        parameterValue: { arrayValues: arr_values_months }
      }
    ],
    query: CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY,
    timeoutMs: query_timeout_ms,
    useLegacySql: false
  }

  let query_response = BigQuery.Jobs.query(request, GCP_PROJECT_ID)

  const job_id = query_response.jobReference.jobId

  let sleep_ms = 500
  while (!query_response.jobComplete) {
    Utilities.sleep(sleep_ms)
    sleep_ms *= 2
    query_response = BigQuery.Jobs.getQueryResults(GCP_PROJECT_ID, job_id)
  }

  let rows = query_response.rows
  while (query_response.pageToken) {
    query_response = BigQuery.Jobs.getQueryResults(GCP_PROJECT_ID, job_id, {
      pageToken: query_response.pageToken
    })
    rows = rows.concat(query_response.rows)
  }

  const summary =
    'The query on the CrUX BigQuery dataset returned no records. Try using different values for the query parameters.'
  const details = [JSON.stringify({ url, months }, null, 2)]

  // If the query ran but returned no results, we could consider it a success
  // condition, but I think it would be confusing to the user and maybe a bit
  // trickier to handle on the frontend. Instead, if we throw an error, the
  // frontend can simply display it and the user will probably understand and
  // try a different combination of query parameters.
  if (!rows) {
    logJSON({
      message: `${summary} (see JSON payload in Cloud Logging)`,
      tags: ['bigquery', 'crux'],
      query_parameters: request.queryParameters
    })
    throw new Error(`${summary}\n${details.join('\n')}`)
  }

  const data = new Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].f
    data[i] = new Array(cols.length)
    for (let j = 0; j < cols.length; j++) {
      data[i][j] = cols[j].v
    }
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  let s = url.replace('https://', '')
  if (s[s.length - 1] === '/') {
    s = s.slice(0, s.length - 1)
  } else {
    s = s.slice(0, s.length)
  }

  const sheet_name = `${s} ${months.join('-')}`

  let sheet = spreadsheet.getSheetByName(sheet_name)
  if (sheet != null) {
    spreadsheet.deleteSheet(sheet)
  }

  sheet = spreadsheet.insertSheet()
  sheet.setName(sheet_name)

  const headers = query_response.schema.fields.map((f) => f.name)

  let range = sheet.getRange(1, 1, 1, headers.length)
  range.setBackgroundRGB(255, 255, 0)
  range.setFontWeight('bold')
  sheet.appendRow(headers)

  range = sheet.getRange(2, 1, rows.length, sheet.getLastColumn())
  range.setValues(data)

  return {
    message: `Retrieved data from CrUX. Added sheet ${sheet_name} in currently active spreadsheet`
  }
}

function TEST_QUERY_CRUX_VINO_COM() {
  runQueryOnCrux({
    url: 'https://www.vino.com',
    months: [202303, 202304, 202305]
  })
}

/**
 * Runs a parameterized query on the BigQuery CrUX dataset and writes the
 * results into a new sheet in the active spreadsheet.
 *
 * @param {Object} options Configuration for the query.
 * @return {Object} Recap of the operation.
 * @customFunction
 * @see {@link https://cloud.google.com/bigquery/docs/reference/rest/v2/Job BigQuery Job}
 * @see {@link https://developers.google.com/identity/protocols/oauth2/scopes#bigquery BigQuery API v2 OAuth scopes}
 */
function runQueryPoorTTFBOnCrux(options: CruxBigQueryPoorTTFBOptions = {}) {
  logJSON({
    message:
      'run Query on CrUX using these options (see JSON payload in Cloud Logging)',
    tags: ['bigquery', 'crux'],
    options
  })

  // Each queryParameters[] parameterValue's `value` MUST be a string
  // The BigQuery API will cast it to the queryParameters[] parameterType's type
  const country_code = options.country_code || DEFAULT.COUNTRY_CODE
  const form_factor = options.form_factor || DEFAULT.FORM_FACTOR
  const yyyymm = options.yyyymm || DEFAULT.YYYYMM

  const query_timeout_ms = options.query_timeout_ms || DEFAULT.QUERY_TIMEOUT_MS
  // Set maximumBytesBilled to control the costs and avoid unexpected billing charges
  // https://cloud.google.com/bigquery/docs/best-practices-costs#limit_query_costs_by_restricting_the_number_of_bytes_billed
  const maximumBytesBilled =
    options.maximum_bytes_billed || DEFAULT.MAXIMUM_BYTES_BILLED

  const request = {
    // dryRun: true,
    dryRun: false,
    maximumBytesBilled,
    parameterMode: 'NAMED',
    // https://cloud.google.com/bigquery/docs/reference/rest/v2/QueryParameter
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#data_type_sizes
    queryParameters: [
      {
        name: 'country_code',
        parameterType: { type: 'STRING' },
        parameterValue: { value: country_code }
      },
      {
        name: 'form_factor',
        parameterType: { type: 'STRING' },
        parameterValue: { value: form_factor }
      },
      {
        name: 'yyyymm',
        parameterType: { type: 'INT64' },
        parameterValue: { value: `${yyyymm}` }
      }
    ],
    query: CRUX_QUERY_POOR_TTFB,
    timeoutMs: query_timeout_ms,
    useLegacySql: false
  }

  let query_response = BigQuery.Jobs.query(request, GCP_PROJECT_ID)

  const job_id = query_response.jobReference.jobId

  let sleep_ms = 500
  while (!query_response.jobComplete) {
    Utilities.sleep(sleep_ms)
    sleep_ms *= 2
    query_response = BigQuery.Jobs.getQueryResults(GCP_PROJECT_ID, job_id)
  }

  let rows = query_response.rows
  while (query_response.pageToken) {
    query_response = BigQuery.Jobs.getQueryResults(GCP_PROJECT_ID, job_id, {
      pageToken: query_response.pageToken
    })
    rows = rows.concat(query_response.rows)
  }

  const summary =
    'The query on the CrUX BigQuery dataset returned no records. Try using different values for the query parameters.'
  const details = [JSON.stringify({ country_code, form_factor }, null, 2)]

  // If the query ran but returned no results, we could consider it a success
  // condition, but I think it would be confusing to the user and maybe a bit
  // trickier to handle on the frontend. Instead, if we throw an error, the
  // frontend can simply display it and the user will probably understand and
  // try a different combination of query parameters.
  if (!rows) {
    logJSON({
      message: `${summary} (see JSON payload in Cloud Logging)`,
      tags: ['bigquery', 'crux'],
      query_parameters: request.queryParameters
    })
    throw new Error(`${summary}\n${details.join('\n')}`)
  }

  const data = new Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].f
    data[i] = new Array(cols.length)
    for (let j = 0; j < cols.length; j++) {
      data[i][j] = cols[j].v
    }
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  const sheet_name = `${country_code}_poor_ttfb_${form_factor}_${yyyymm}`

  let sheet = spreadsheet.getSheetByName(sheet_name)
  if (sheet != null) {
    spreadsheet.deleteSheet(sheet)
  }

  sheet = spreadsheet.insertSheet()
  sheet.setName(sheet_name)

  const headers = query_response.schema.fields.map((f) => f.name)

  let range = sheet.getRange(1, 1, 1, headers.length)
  range.setBackgroundRGB(255, 255, 0)
  range.setFontWeight('bold')
  sheet.appendRow(headers)

  range = sheet.getRange(2, 1, rows.length, sheet.getLastColumn())
  range.setValues(data)

  return {
    message: `Retrieved data from CrUX. Added sheet ${sheet_name} in currently active spreadsheet`
  }
}

function TEST_QUERY_CRUX_POOR_TTFB() {
  runQueryPoorTTFBOnCrux({
    country_code: 'IT',
    form_factor: 'PHONE',
    yyyymm: 202306
  })
}
