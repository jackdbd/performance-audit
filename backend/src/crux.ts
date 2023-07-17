import { PREFIX } from '../../shared/src/constants'
import { CRUX_HISTORY_API_METRICS } from './constants'
import { logJSON } from './utils'

export type FormFactor = 'PHONE' | 'TABLET' | 'DESKTOP'

export interface HistogramBin {
  start: number
  end: number
  densities: number[]
}

export interface CollectionPeriod {
  firstDate: { year: number; month: number; day: number }
  lastDate: { year: number; month: number; day: number }
}

export interface CruxHistoryApiResultRecord {
  key: { formFactor: FormFactor; origin?: string; url?: string }
  metrics: {
    cumulative_layout_shift?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: string[] }
    }
    experimental_interaction_to_next_paint?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: number[] }
    }
    experimental_time_to_first_byte?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: number[] }
    }
    first_contentful_paint?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: number[] }
    }
    first_input_delay?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: number[] }
    }
    interaction_to_next_paint?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: number[] }
    }
    largest_contentful_paint?: {
      histogramTimeseries: HistogramBin[]
      percentilesTimeseries: { [percentile: string]: number[] }
    }
  }
  collectionPeriods: CollectionPeriod[]
}

export interface CruxHistoryApiResultError {
  code: 404
  message: 'chrome ux report data not found'
  status: 'NOT_FOUND'
}

export interface CruxHistoryApiResult {
  error?: CruxHistoryApiResultError
  record?: CruxHistoryApiResultRecord
  urlNormalizationDetails?: {
    originalUrl: string
    normalizedUrl: string
  }
}

const COLOR = {
  GOOD: '#0CCE6B',
  NEEDS_IMPROVEMENT: '#FFA303',
  POOR: '#FE4D43'
}

/**
 * Retrieves the CrUX API key from your Apps Script project settings.
 *
 * @return {string} Your CrUX API key.
 * @see{@link https://developers.google.com/apps-script/guides/properties Properties Service}
 * @customFunction
 */
export const GET_CRUX_API_KEY = () => {
  return PropertiesService.getScriptProperties().getProperty('CRUX_API_KEY')
}

export interface GetCruxDataConfig {
  form_factor: FormFactor | 'AGGREGATED'
  url: string
}

export const getCruxData = (config: GetCruxDataConfig) => {
  const endpoint =
    'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'

  const api_key = GET_CRUX_API_KEY()

  const payload = {
    // origin: config.origin,
    url: config.url,
    // If no formFactor value is provided then the values will be aggregated
    // across all form factors.
    formFactor: config.form_factor,
    metrics: CRUX_HISTORY_API_METRICS
  }

  const options = {
    method: 'post' as 'post',
    // https://spreadsheet.dev/comprehensive-guide-urlfetchapp-apps-script#mutehttpexceptions-in-urlfetchapp
    muteHttpExceptions: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  }

  // https://spreadsheet.dev/comprehensive-guide-urlfetchapp-apps-script
  const response = UrlFetchApp.fetch(`${endpoint}?key=${api_key}`, options)
  const result = JSON.parse(response.getContentText()) as CruxHistoryApiResult

  logJSON({
    message: `URLFetchApp response result for URL ${config.url} (see JSON payload)`,
    severity: 'DEBUG',
    tags: ['crux', 'fetch'],
    result
  })

  if (result.error) {
    const text = result.error.message || 'Unknown error'
    const code = result.error.code || 'Unknown status code'
    return { error: new Error(`[${code}]: ${text}`) }
  } else {
    return { value: result.record }
  }
}

export const densities = (metric: any, i: number) => {
  return metric.histogramTimeseries[i].densities.map((n: any) => {
    return n === 'NaN' ? null : n
  })
}

export const processRecord = (record: CruxHistoryApiResultRecord) => {
  const { collectionPeriods, key, metrics } = record

  const dates = collectionPeriods.map((cp) => {
    const { year, day } = cp.lastDate
    // In each CrUX collectionPeriod, months are 1..12
    // Instead, in JS dates are 0..11
    const month = cp.lastDate.month - 1
    const d = new Date()
    d.setFullYear(year)
    d.setMonth(month)
    d.setDate(day)
    const [yyyy_mm_dd] = d.toISOString().split('T')
    return yyyy_mm_dd
  })

  // logJSON({
  //   message:
  //     'process CrUX History API record (see JSON payload in Cloud Logging)',
  //   tags: ['crux', 'history', 'field-performance'],
  //   formFactor: key.formFactor,
  //   origin: key.origin,
  //   severity: 'DEBUG',
  //   url: key.url,
  //   collectionPeriods,
  //   dates,
  //   metrics
  // })

  return {
    formFactor: key.formFactor,
    origin: key.origin,
    url: key.url,
    dates,
    metrics,
    'CLS good': densities(metrics.cumulative_layout_shift, 0),
    'CLS needs improvement': densities(metrics.cumulative_layout_shift, 1),
    'CLS poor': densities(metrics.cumulative_layout_shift, 2),
    'CLS p75': metrics.cumulative_layout_shift.percentilesTimeseries.p75s.map(
      (s) => {
        return s === null ? null : parseFloat(s)
      }
    ),

    'FCP good': densities(metrics.first_contentful_paint, 0),
    'FCP needs improvement': densities(metrics.first_contentful_paint, 1),
    'FCP poor': densities(metrics.first_contentful_paint, 2),
    'FCP p75': metrics.first_contentful_paint.percentilesTimeseries.p75s,

    'FID good': densities(metrics.first_input_delay, 0),
    'FID needs improvement': densities(metrics.first_input_delay, 1),
    'FID poor': densities(metrics.first_input_delay, 2),
    'FID p75': metrics.first_input_delay.percentilesTimeseries.p75s,

    'INP good': densities(metrics.interaction_to_next_paint, 0),
    'INP needs improvement': densities(metrics.interaction_to_next_paint, 1),
    'INP poor': densities(metrics.interaction_to_next_paint, 2),
    'INP p75': metrics.interaction_to_next_paint.percentilesTimeseries.p75s,

    'LCP good': densities(metrics.largest_contentful_paint, 0),
    'LCP needs improvement': densities(metrics.largest_contentful_paint, 1),
    'LCP poor': densities(metrics.largest_contentful_paint, 2),
    'LCP p75': metrics.largest_contentful_paint.percentilesTimeseries.p75s,

    'TTFB good': densities(metrics.experimental_time_to_first_byte, 0),
    'TTFB needs improvement': densities(
      metrics.experimental_time_to_first_byte,
      1
    ),
    'TTFB poor': densities(metrics.experimental_time_to_first_byte, 2),
    'TTFB p75':
      metrics.experimental_time_to_first_byte.percentilesTimeseries.p75s
  }
}

/**
 * Calls the CrUX history API to retrieve field performance data.
 *
 * @param {Object} config Configuration for the query to run against the CrUX History API.
 * @return {Object} Recap of the operation.
 * @customFunction
 */
function callCrUXHistoryAPI(config: GetCruxDataConfig) {
  const url = config.url
  const form_factor =
    config.form_factor === 'AGGREGATED' ? undefined : config.form_factor

  logJSON({
    message: `retrieve field performance data of ${url} using the CrUX history API (see JSON payload in Cloud Logging)`,
    severity: 'DEBUG',
    tags: ['crux', 'history', 'field-performance'],
    url,
    form_factor
  })

  const { error, value } = getCruxData({ url, form_factor })
  if (error) {
    throw error
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  let sheet_name = url.replaceAll('https://', '')

  if (form_factor) {
    sheet_name = `${sheet_name} ${form_factor}`
  } else {
    sheet_name = `${sheet_name} AGGREGATED`
  }

  let sheet = spreadsheet.getSheetByName(sheet_name)
  if (sheet != null) {
    spreadsheet.deleteSheet(sheet)
  }

  sheet = spreadsheet.insertSheet()
  sheet.setName(sheet_name)

  const m = processRecord(value)

  const headers = [
    'YYYY-MM-DD',

    'CLS good',
    'CLS needs improvement',
    'CLS poor',
    'CLS p75',

    'FCP good',
    'FCP needs improvement',
    'FCP poor',
    'FCP p75',

    'FID good',
    'FID needs improvement',
    'FID poor',
    'FID p75',

    'INP good',
    'INP needs improvement',
    'INP poor',
    'INP p75',

    'LCP good',
    'LCP needs improvement',
    'LCP poor',
    'LCP p75',

    'TTFB good',
    'TTFB needs improvement',
    'TTFB poor',
    'TTFB p75'
  ]

  let range = sheet.getRange(1, 1, 1, headers.length)
  range.setBackgroundRGB(255, 255, 0)
  range.setFontWeight('bold')
  sheet.appendRow(headers)

  const rows = new Array(m.dates.length)

  for (let i = 0; i < rows.length; i++) {
    rows[i] = [
      m.dates[i], // A:A

      m['CLS good'][i], // B:B
      m['CLS needs improvement'][i], // C:C
      m['CLS poor'][i], // D:D
      m['CLS p75'][i], // E:E

      m['FCP good'][i],
      m['FCP needs improvement'][i],
      m['FCP poor'][i],
      m['FCP p75'][i], // I:I

      m['FID good'][i], // J:J
      m['FID needs improvement'][i], // K:K
      m['FID poor'][i], // L:L
      m['FID p75'][i], // M:M

      m['INP good'][i],
      m['INP needs improvement'][i],
      m['INP poor'][i],
      m['INP p75'][i], // Q:Q

      m['LCP good'][i],
      m['LCP needs improvement'][i],
      m['LCP poor'][i],
      m['LCP p75'][i], // U:U

      m['TTFB good'][i], // V:V
      m['TTFB needs improvement'][i], // W:W
      m['TTFB poor'][i], // X:X
      m['TTFB p75'][i] // Y:Y
    ]
  }

  range = sheet.getRange(2, 1, rows.length, sheet.getLastColumn())
  range.setValues(rows)

  // TODO: extract good/soso/poor interval ranges from histogramTimeseries' start/end

  // TODO: add all charts using a private function addCharts_
  // https://developers.google.com/apps-script/guides/sheets/functions#guidelines_for_custom_functions
  // https://stackoverflow.com/questions/29014087/apps-script-private-functions

  // n rows for data, 1 row for headers, 1 row to have some space before the charts
  const START_ROW_POS = rows.length + 1 + 1
  const START_COL_POS = 1
  // chart height, width, gap in spreadsheet cells
  const CHART_HEIGHT = 18
  const CHART_WIDTH = 6
  const CHART_GAP = 1

  const bar_chart_ttfb = sheet
    .newChart()
    .asBarChart()
    .addRange(sheet.getRange('A:A'))
    .addRange(sheet.getRange('V:V'))
    .addRange(sheet.getRange('W:W'))
    .addRange(sheet.getRange('X:X'))
    .setNumHeaders(1)
    .setPosition(START_ROW_POS, START_COL_POS, 0, 0)
    .setOption('isStacked', 'percent')
    .setOption('colors', [COLOR.GOOD, COLOR.NEEDS_IMPROVEMENT, COLOR.POOR])
    // .setOption('useFirstColumnAsDomain', true)
    .setOption('title', 'Time To First Byte')
    .setOption(
      'subtitle',
      'Good: < 800ms; Needs improvement: [800ms 1800ms]; Poor: > 1800ms'
    )
    .build()

  sheet.insertChart(bar_chart_ttfb)

  // https://developers.google.com/apps-script/reference/spreadsheet/embedded-line-chart-builder
  const timeline_chart_ttfb = sheet
    .newChart()
    .asLineChart()
    .addRange(sheet.getRange('A:A'))
    .addRange(sheet.getRange('Y:Y'))
    // https://support.google.com/docs/answer/9146783?sjid=971494266342524415-EU
    .setChartType(Charts.ChartType.TIMELINE)
    .setNumHeaders(1)
    .setOption('useFirstColumnAsDomain', true)
    .setOption('hAxis', {
      slantedText: true,
      slantedTextAngle: 60,
      gridlines: {
        count: 12
      }
    })
    .setOption('vAxis', { title: 'ms' })
    .setOption('title', 'TTFB')
    .setOption('subtitle', '75th percentile')
    // .setLegendPosition(Charts.Position.RIGHT)
    .setPosition(START_ROW_POS, START_COL_POS + CHART_WIDTH + CHART_GAP, 0, 0)
    .build()

  sheet.insertChart(timeline_chart_ttfb)

  const bar_chart_cls = sheet
    .newChart()
    .asBarChart()
    .addRange(sheet.getRange('A:A'))
    .addRange(sheet.getRange('B:B'))
    .addRange(sheet.getRange('C:C'))
    .addRange(sheet.getRange('D:D'))
    .setNumHeaders(1)
    .setPosition(START_ROW_POS + CHART_HEIGHT + CHART_GAP, START_COL_POS, 0, 0)
    .setOption('isStacked', 'percent')
    .setOption('colors', [COLOR.GOOD, COLOR.NEEDS_IMPROVEMENT, COLOR.POOR])
    .setOption('title', 'Cumulative Layout Shift')
    .setOption(
      'subtitle',
      'Good: < 0.10; Needs improvement: [0.10 0.25]; Poor: > 0.25'
    )
    .build()

  sheet.insertChart(bar_chart_cls)

  const line_chart_cls = sheet
    .newChart()
    .asLineChart()
    .addRange(sheet.getRange('A:A'))
    .addRange(sheet.getRange('E:E'))
    .setNumHeaders(1)
    .setOption('useFirstColumnAsDomain', true)
    .setOption('title', 'CLS')
    .setOption('subtitle', '75th percentile')
    .setPosition(
      START_ROW_POS + CHART_HEIGHT + CHART_GAP,
      START_COL_POS + CHART_WIDTH + CHART_GAP,
      0,
      0
    )
    .build()

  sheet.insertChart(line_chart_cls)

  const bar_chart_inp = sheet
    .newChart()
    .asBarChart()
    .addRange(sheet.getRange('A:A'))
    .addRange(sheet.getRange('J:J'))
    .addRange(sheet.getRange('K:K'))
    .addRange(sheet.getRange('L:L'))
    .setNumHeaders(1)
    .setPosition(
      START_ROW_POS + CHART_HEIGHT * 2 + CHART_GAP * 2,
      START_COL_POS,
      0,
      0
    )
    .setOption('isStacked', 'percent')
    .setOption('colors', [COLOR.GOOD, COLOR.NEEDS_IMPROVEMENT, COLOR.POOR])
    // .setOption('useFirstColumnAsDomain', true)
    .setOption('title', 'Interaction to Next Paint')
    .build()

  sheet.insertChart(bar_chart_inp)

  const line_chart_fcp_vs_lcp = sheet
    .newChart()
    .asLineChart()
    .addRange(sheet.getRange('A:A'))
    .addRange(sheet.getRange('I:I'))
    .addRange(sheet.getRange('U:U'))
    .setNumHeaders(1)
    .setOption('useFirstColumnAsDomain', true)
    .setOption('title', 'FCP vs LCP')
    .setOption('subtitle', '75th percentile')
    .setPosition(
      START_ROW_POS + CHART_HEIGHT * 2 + CHART_GAP * 2,
      START_COL_POS + CHART_WIDTH + CHART_GAP,
      0,
      0
    )
    .build()

  sheet.insertChart(line_chart_fcp_vs_lcp)

  const messages = [
    `Retrieved field performance data of ${url} using the CrUX History API`,
    `Added sheet ${sheet_name} in currently active spreadsheet`,
    `Added charts in sheet ${sheet_name}`
  ]
  const message = messages.join(' ')

  logJSON({
    message,
    severity: 'DEBUG',
    tags: ['crux', 'history', 'field-performance'],
    url,
    form_factor
  })

  return { message }
}

function TEST_URL_FOUND_IN_CRUX() {
  const { error, value } = getCruxData({
    url: 'https://web.dev/',
    form_factor: 'DESKTOP'
  })
  if (error) {
    console.error(`${PREFIX} error: ${error.message}`)
  }
  if (value) {
    console.log(`${PREFIX} value`, value)
  }
}

function TEST_URL_NOT_FOUND_IN_CRUX() {
  const { error, value } = getCruxData({
    url: 'https://giacomodebidda.com/contact/',
    form_factor: 'PHONE'
  })
  if (error) {
    console.error(`${PREFIX} error: ${error.message}`)
  }
  if (value) {
    console.log(`${PREFIX} value`, value)
  }
}
