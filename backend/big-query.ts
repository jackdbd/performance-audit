export interface RunQueryOptions {
  project_id?: string
  url?: string
  months?: number[]
  query_timeout_ms?: number
}

/**
 * Runs a BigQuery query and logs the results in a spreadsheet.
 * @see {@link https://developers.google.com/identity/protocols/oauth2/scopes#bigquery BigQuery API v2 OAuth scopes}
 */
function runQueryOnCrux(options: RunQueryOptions = {}) {
  // Each queryParameters[] parameterValue's value must be a string;
  // The BigQuery API will cast it to the queryParameters[] parameterType's type
  const url = options.url || 'https://www.google.com/'
  const months = options.months || [202301, 202302, 202303]
  const project_id = options.project_id || 'prj-kitchen-sink'
  // const dataset_id = options.dataset_id || 'weather_data';
  // const table_id = options.table_id || 'weather_data_table';
  const query_timeout_ms = options.query_timeout_ms || 5000

  const query = `
WITH cte AS (
  SELECT
    yyyymm,
    \`chrome-ux-report.experimental\`.GET_COUNTRY(country_code) AS country,
    rank,
    desktopDensity,
    phoneDensity,
    tabletDensity
  FROM
    \`chrome-ux-report.materialized.country_summary\`
  WHERE
    origin = @url
  AND yyyymm IN UNNEST(@months)
)
SELECT
  country,
  ROUND(AVG(rank)) AS coarse_popularity,
  COUNT(DISTINCT yyyymm) AS months_in_crux,
  SAFE_MULTIPLY(ROUND(SUM(desktopDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS desktop_traffic,
  SAFE_MULTIPLY(ROUND(SUM(phoneDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS phone_traffic,
  SAFE_MULTIPLY(ROUND(SUM(tabletDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS tablet_traffic
FROM
  cte
GROUP BY
  country
ORDER BY
  coarse_popularity ASC`

  const arr_values_months = months.map((value) => {
    return { value: value as any }
  })
  // console.log('arr_values_months', arr_values_months)

  // https://cloud.google.com/bigquery/docs/reference/rest/v2/Job
  // TODO: consider setting maximumBytesBilled
  const request = {
    // dryRun: true,
    dryRun: false,
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
    query,
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

  // console.log(`DATA ${data.length} rows`, data)

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet_name = `CrUX ${url}_${months.join('_')}`

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
}

function TEST_QUERY_TIRRENO() {
  runQueryOnCrux({ url: 'https://www.iltirreno.it' })
}

function TEST_QUERY_VINO() {
  runQueryOnCrux({ url: 'https://www.vino.com', months: [202304, 202305] })
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
