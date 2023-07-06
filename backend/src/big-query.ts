import { CRUX_QUERY } from './constants'
import { logJSON } from './utils'

export interface RunQueryOptions {
  maximum_bytes_billed?: number
  months?: number[]
  project_id?: string
  query_timeout_ms?: number
  url?: string
}

/**
 * Runs a parameterized query on the BigQuery CrUX dataset and writes the
 * results into a new sheet in the active spreadsheet.
 *
 * @param {Object} options Configuration for the query.
 * @return {Object} Recap of the operation.
 * @customFunction
 * @see {@link https://developers.google.com/identity/protocols/oauth2/scopes#bigquery BigQuery API v2 OAuth scopes}
 */
function runQueryOnCrux(options: RunQueryOptions = {}) {
  // const tags = ['bigquery', 'crux']
  logJSON({
    message:
      'run Query on CrUX using these options (see JSON payload in Cloud Logging)',
    tags: ['bigquery', 'crux'],
    options
  })

  // Logger.log({
  //   message:
  //     'run Query on CrUX using these options (see JSON payload in Cloud Logging)',
  //   options,
  //   severity: 'INFO',
  //   tags,
  //   tag: tags.reduce(tagReducer, {})
  // })

  // Each queryParameters[] parameterValue's value must be a string;
  // The BigQuery API will cast it to the queryParameters[] parameterType's type
  const url = options.url || 'https://www.google.com/'
  const months = options.months || [202301, 202302, 202303]
  const project_id = options.project_id || 'prj-kitchen-sink'
  const query_timeout_ms = options.query_timeout_ms || 5000
  // Set maximumBytesBilled to control the costs and avoid unexpected billing charges
  // https://cloud.google.com/bigquery/docs/best-practices-costs#limit_query_costs_by_restricting_the_number_of_bytes_billed
  const maximumBytesBilled = options.maximum_bytes_billed || 12_000_000_000

  const arr_values_months = months.map((value) => {
    return { value: value as any }
  })

  // https://cloud.google.com/bigquery/docs/reference/rest/v2/Job

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
    query: CRUX_QUERY,
    timeoutMs: query_timeout_ms,
    useLegacySql: false
  }

  let query_response = BigQuery.Jobs.query(request, project_id)

  const job_id = query_response.jobReference.jobId

  let sleep_ms = 500
  while (!query_response.jobComplete) {
    Utilities.sleep(sleep_ms)
    sleep_ms *= 2
    query_response = BigQuery.Jobs.getQueryResults(project_id, job_id)
  }

  let rows = query_response.rows
  while (query_response.pageToken) {
    query_response = BigQuery.Jobs.getQueryResults(project_id, job_id, {
      pageToken: query_response.pageToken
    })
    rows = rows.concat(query_response.rows)
  }

  if (!rows) {
    console.log('No rows returned.')
    return
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
  const u = new URL(url)
  const domain = u.origin.replace('https://', '')
  const sheet_name = `CrUX ${domain}_${months.join('_')}`
  // const sheet_name = `CrUX ${url}_${months.join('_')}`

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

function TEST_QUERY_CRUX_TIRRENO_IT() {
  runQueryOnCrux({ url: 'https://www.iltirreno.it' })
}

function TEST_QUERY_CRUX_VINO_COM() {
  runQueryOnCrux({
    url: 'https://www.vino.com',
    months: [202303, 202304, 202305]
  })
}

function runDemoQuery(options: any = {}) {
  const project_id = 'prj-kitchen-sink'
  const limit = options.limit || '100'

  const query = `
  SELECT 
    * 
  FROM 
    \`${project_id}.weather_data.weather_data_table\` 
  LIMIT @limit;`

  const request = {
    // dryRun: true,
    dryRun: false,
    parameterMode: 'NAMED',
    // https://cloud.google.com/bigquery/docs/reference/rest/v2/QueryParameter
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#data_type_sizes
    queryParameters: [
      {
        name: 'limit',
        parameterType: { type: 'INT64' },
        parameterValue: { value: limit }
      }
    ],
    query,
    timeoutMs: 5000,
    useLegacySql: false
  }

  let query_response = BigQuery.Jobs.query(request, project_id)

  const job_id = query_response.jobReference.jobId

  let sleep_ms = 500
  while (!query_response.jobComplete) {
    Utilities.sleep(sleep_ms)
    sleep_ms *= 2
    query_response = BigQuery.Jobs.getQueryResults(project_id, job_id)
  }

  let rows = query_response.rows

  while (query_response.pageToken) {
    query_response = BigQuery.Jobs.getQueryResults(project_id, job_id, {
      pageToken: query_response.pageToken
    })
    rows = rows.concat(query_response.rows)
  }

  if (!rows) {
    console.log('No rows returned.')
    return
  }

  const data = new Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].f
    data[i] = new Array(cols.length)
    for (let j = 0; j < cols.length; j++) {
      data[i][j] = cols[j].v
    }
  }
  // console.log(`DATA ${data.length} rows`, data)

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet_name = 'Result demo'

  let sheet = spreadsheet.getSheetByName(sheet_name)
  if (sheet != null) {
    spreadsheet.deleteSheet(sheet)
  }

  sheet = spreadsheet.insertSheet()
  sheet.setName(sheet_name)

  const headers = query_response.schema.fields.map((f) => f.name)
  // const headers = [
  //   'sensor_id',
  //   'time_collected',
  //   'zipcode',
  //   'latitude',
  //   'longitude',
  //   'temperature',
  //   'humidity',
  //   'dewpoint',
  //   'pressure'
  // ]
  let range = sheet.getRange(1, 1, 1, headers.length)
  range.setBackgroundRGB(255, 255, 0)
  range.setFontWeight('bold')
  sheet.appendRow(headers)

  range = sheet.getRange(2, 1, rows.length, sheet.getLastColumn())
  range.setValues(data)
  range.setFontStyle('italic')
}

function TEST_DEMO_QUERY() {
  runDemoQuery({ limit: '50' })
}
