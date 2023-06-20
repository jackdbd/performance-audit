import * as fs from 'node:fs'
import * as path from 'node:path'

const NAME = path.basename(import.meta.url)

const repo_root = process.cwd()
const outdir = path.join(repo_root, 'dist')

const bundle = ({ file_path }) => {
  let s = fs.readFileSync(file_path).toString()
  s = s.replaceAll(
    /import( type)? {.*} from .*\n/g,
    `// import stripped by ${NAME}\n`
  )
  s = s.replaceAll(/export const/g, `const`)
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
      file_path: path.join('src', file_name)
    })
  )
})

const root_html = path.join('frontend', 'templates')
fs.readdirSync(root_html).forEach((file_name) => {
  fs.copyFileSync(path.join(root_html, file_name), path.join(outdir, file_name))
})

let sidebar_js = '<script>\n'
const root_js = path.join('frontend', 'js')
fs.readdirSync(root_js).forEach((file_name) => {
  const file_path = path.join(root_js, file_name)
  sidebar_js = sidebar_js.concat(fs.readFileSync(file_path).toString())
})
sidebar_js = sidebar_js.concat('\n</script>')
fs.writeFileSync(path.join(outdir, 'sidebar-js.html'), sidebar_js)

let sidebar_css = '<style>\n'
const root_css = path.join('frontend', 'css')
fs.readdirSync(root_css).forEach((file_name) => {
  const file_path = path.join(root_css, file_name)
  sidebar_css = sidebar_css.concat(fs.readFileSync(file_path).toString())
})
sidebar_css = sidebar_css.concat('\n</style>')
fs.writeFileSync(path.join(outdir, 'sidebar-css.html'), sidebar_css)
