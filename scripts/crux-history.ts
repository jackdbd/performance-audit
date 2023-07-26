import fs from 'node:fs'
import path from 'node:path'
import yargs from 'yargs/yargs'
import * as csv from 'fast-csv'
import { processRecord } from '../backend/src/crux'
import { CRUX_HISTORY_API_METRICS } from '../backend/src/constants'

interface Argv {
  url: string
  formFactor?: string
}

const main = async () => {
  const argv = yargs(process.argv.slice(2))
    .usage(
      'Usage:\nnpx tsm scripts/$0 - Search field performance data using the CrUX history API'
    )
    .option('url', {
      alias: 'u',
      describe: 'URL or origin to search in CrUX',
      demandOption: true
    })
    .option('form-factor', {
      alias: 'f',
      describe: 'form factor',
      choices: ['PHONE', 'DESKTOP', 'TABLET']
    })
    .example(
      'npx tsm scripts/$0 --url https://www.vino.com/ --form-factor DESKTOP',
      'Retrieve field performance data of the entire origin of vino.com, for DESKTOP devices'
    )
    .example(
      'npx tsm scripts/$0 -u https://www.vino.com/vino/rosso -f PHONE',
      'Retrieve field performance data of a specific URL of vino.com, for PHONE devices'
    )
    .help('help').argv as Argv

  const api_key = process.env.CRUX_API_KEY

  const endpoint =
    'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'

  const body = {
    // origin: argv.url,
    url: argv.url,
    // If no formFactor value is provided then the values will be aggregated
    // across all form factors.
    formFactor: argv.formFactor,
    metrics: CRUX_HISTORY_API_METRICS
  }

  const res = await fetch(`${endpoint}?key=${api_key}`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const result = await res.json()

  if (result.error) {
    console.error(result.error)
    return
  }

  if (result.record) {
    const data = processRecord(result.record)
    // console.log(data)
    // fs.writeFileSync('record.json', JSON.stringify(result.record, null, 2))

    const csvStream = csv.format({ headers: true })

    data.dates.forEach((d, i) => {
      csvStream.write({
        'YYYY-MM-DD': d,

        'CLS good': data['CLS good'][i],
        'CLS needs improvement': data['CLS needs improvement'][i],
        'CLS poor': data['CLS poor'][i],
        'CLS p75': data['CLS p75'][i],

        'FCP good': data['FCP good'][i],
        'FCP needs improvement': data['FCP needs improvement'][i],
        'FCP poor': data['FCP poor'][i],
        'FCP p75': data['FCP p75'][i],

        'FID good': data['FID good'][i],
        'FID needs improvement': data['FID needs improvement'][i],
        'FID poor': data['FID poor'][i],
        'FID p75': data['FID p75'][i],

        'INP good': data['INP good'][i],
        'INP needs improvement': data['INP needs improvement'][i],
        'INP poor': data['INP poor'][i],
        'INP p75': data['INP p75'][i],

        'LCP good': data['LCP good'][i],
        'LCP needs improvement': data['LCP needs improvement'][i],
        'LCP poor': data['LCP poor'][i],
        'LCP p75': data['LCP p75'][i],

        'TTFB good': data['TTFB good'][i],
        'TTFB needs improvement': data['TTFB needs improvement'][i],
        'TTFB poor': data['TTFB poor'][i],
        'TTFB p75': data['TTFB p75'][i]
      })
    })

    csvStream.end()

    let filename = (argv.url as any)
      .replaceAll('https://', '')
      .replaceAll('.', '-')
      .replaceAll('/', '_')

    if (!argv.formFactor) {
      filename = `${filename}_aggregated.csv`
    } else {
      filename = `${filename}_${argv.formFactor}.csv`
    }

    const csv_rootdir = path.join(process.cwd(), 'assets', 'csv')
    const writeStream = fs.createWriteStream(path.join(csv_rootdir, filename))
    csvStream.pipe(writeStream)
    console.log(`wrote ${path.join(csv_rootdir, filename)}`)
  }
}

main()
