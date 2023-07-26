import fs from 'node:fs'
import path from 'node:path'
import yargs from 'yargs/yargs'
import * as csv from 'fast-csv'
import { BigQuery } from '@google-cloud/bigquery'
import { CRUX_QUERY_POOR_TTFB } from '../shared/src/constants'

interface Argv {
  countryCode: string
  formFactor: string
  yyyymm: number
}

const main = async () => {
  const argv = yargs(process.argv.slice(2))
    .usage(
      'Usage:\nnpx tsm scripts/$0 - Search origins with poor TTFB using the CrUX BigQuery dataset'
    )
    .option('country-code', {
      alias: 'c',
      describe: 'Country code to use in the query',
      demandOption: true
    })
    .option('form-factor', {
      alias: 'f',
      choices: ['DESKTOP', 'TABLET', 'PHONE'],
      describe: 'Form factor to use in the query',
      demandOption: true
    })
    .option('yyyymm', {
      describe: 'year and month to use in the query (YYYYMM)',
      demandOption: true
    })
    .example(
      'npx tsm scripts/$0 --country-code IT --yyyymm 202306 --form-factor phone',
      'Retrieve origins that in June 2023 had a poor TTFB field performance, for phones, in Italy'
    )
    .help('help').argv as Argv

  const bq = new BigQuery()

  const country_code = argv.countryCode
  const yyyymm = argv.yyyymm

  const form_factor = argv.formFactor.toLowerCase()

  const params = {
    country_code,
    form_factor,
    yyyymm
  }

  console.log(`Query CrUX using these parameters`, params)

  const options = {
    query: CRUX_QUERY_POOR_TTFB,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
    params
  }

  const [rows] = await bq.query(options)

  console.log(`Retrieved ${rows.length} rows`)
  // rows.forEach((row) => console.log(row))

  const csvStream = csv.format({ headers: true })

  rows.forEach((d, i) => {
    csvStream.write({
      origin: d.origin,
      'TTFB poor': d.ttfb_poor,
      'TTFB needs improvement': d.ttfb_needs_improvement,
      'TTFB good': d.ttfb_good,
      'TTFB p75': d.ttfb_ms_p75
    })
  })

  csvStream.end()

  const filename = `${country_code}_poor_ttfb_${form_factor}_${yyyymm}.csv`
  const csv_rootdir = path.join(process.cwd(), 'assets', 'csv')
  const writeStream = fs.createWriteStream(path.join(csv_rootdir, filename))
  csvStream.pipe(writeStream)
  console.log(`wrote ${path.join(csv_rootdir, filename)}`)
}

main()
