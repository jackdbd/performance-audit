import * as fs from 'node:fs'
import * as path from 'node:path'

const repo_root = process.cwd()
const outdir = path.join(repo_root, 'dist')

const bundle = ({ file_path, substitutions }) => {
  let s = fs.readFileSync(file_path).toString()

  if (substitutions && substitutions.length > 0) {
    substitutions.forEach((sub) => {
      // console.log(`${sub.from} => ${sub.to}`);
      s = s.replaceAll(sub.from, sub.to)
    })
  }

  return s
}

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir)
}

// First, we copy the Apps Script manifest
fs.copyFileSync(
  path.join(repo_root, 'appsscript.json'),
  path.join(outdir, 'appsscript.json')
)

// This is a brittle way to "bundle" all files into a single one. But it is
// simple, and produces highly readable JS code in Apps Script when transpiled
// by clasp (which uses ts2gas).
// Bundling with a real bundler like esbuild produces an undebuggable mess in
// Apps Script. So while it is brittle, I prefer my approach.
// https://github.com/grant/ts2gas

// The order here is NOT important. The one which IS important is the
// filePushOrder field in .clasp.json.
const FILE_NAMES = [
  'constants.ts',
  'utils.ts',
  'spreadsheet.ts',
  'cookie.ts',
  'html.ts',
  'openai.ts',
  'menu.ts',
  'triggers.ts',
  'webpagetest.ts'
]

FILE_NAMES.forEach((file_name) => {
  fs.writeFileSync(
    path.join(outdir, file_name),
    bundle({
      file_path: path.join('src', file_name),
      substitutions: [
        { from: 'export const', to: 'const' },
        {
          from: `import { SHEET_NAME } from './constants'`,
          to: ''
        },
        {
          from: `import { cookiesFromMatrix, runtestParamsFromMatrix } from './utils'`,
          to: ''
        },
        {
          from: `import { runtestParamsFromMatrix } from './utils'`,
          to: ''
        },
        {
          from: `import type { Param } from './utils'`,
          to: ''
        },
        {
          from: `import { GET_WPT_RUNTEST_CELLS } from './spreadsheet'`,
          to: ''
        },
        {
          from: `import { addPerformanceAuditMenuToUi } from './menu'`,
          to: ''
        },
        {
          from: `import { GET_COOKIES_CELLS, GET_WPT_RUNTEST_CELLS } from './spreadsheet'`,
          to: ''
        }
      ]
    })
  )
})

fs.readdirSync(path.join('frontend')).forEach((file_name) => {
  fs.copyFileSync(
    path.join('frontend', file_name),
    path.join(outdir, file_name)
  )
})
