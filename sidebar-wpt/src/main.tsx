import { render } from 'preact'
import { PREFIX } from '../../shared/src/constants'
import { App } from './App.tsx'
import { retrieveSpreadsheetData } from './google-sheets'
import { populateLocalStorageWithFakes } from './local-storage'

if (import.meta.env.DEV) {
  populateLocalStorageWithFakes()
  console.log(`${PREFIX}how to retrieve Google Sheets data in development? Maybe fake it?`)
} else {
  retrieveSpreadsheetData()
}

window.onload = (_ev) => {
  // console.log(`${PREFIX}window.load event fired`)
  render(<App />, document.getElementById('app') as HTMLElement)
}
  