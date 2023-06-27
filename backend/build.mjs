import * as fs from 'node:fs'
import * as path from 'node:path'

const NAME = path.basename(import.meta.url)

const repo_root = path.resolve(process.cwd(), '..')
const outdir = path.join(repo_root, 'dist')

/**
 * Strips all import/export statements from a .ts file, so it can be transpiled
 * by ts2gas when running `clasp push`.
 *
 * @see {@link https://github.com/google/clasp/blob/master/docs/typescript.md TypeScript support in clasp}
 */
const processTypeScriptFile = (file_path) => {
  let s = fs.readFileSync(file_path).toString()
  s = s.replaceAll(
    /import( type)? {.*} from .*\n/g,
    `// import stripped by ${NAME}\n`
  )
  s = s.replaceAll(/export const/g, 'const')
  s = s.replaceAll(/export function/g, 'function')
  s = s.replaceAll(/export interface/g, 'interface')
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

const backend_root = path.join(repo_root, 'backend')

// The order of files here is NOT important. The one which IS important is the
// filePushOrder field in .clasp.json.
fs.readdirSync(path.join(backend_root, 'src')).forEach((file_name) => {
  fs.writeFileSync(
    path.join(outdir, file_name),
    processTypeScriptFile(path.join(backend_root, 'src', file_name))
  )
})

const templates_root = path.join(backend_root, 'templates')

fs.readdirSync(templates_root).forEach((file_name) => {
  fs.copyFileSync(
    path.join(templates_root, file_name),
    path.join(outdir, file_name)
  )
})

const css_root = path.join(backend_root, 'css')

fs.readdirSync(css_root).forEach((file_name) => {
  const file_path_input = path.join(css_root, file_name)
  const file_path_output = path.join(outdir, `${file_name}.html`)

  const css = fs.readFileSync(file_path_input).toString()
  fs.writeFileSync(file_path_output, `<style>\n${css}</style>`)
})
