import { render } from 'preact'
import { PREFIX } from '../../shared/src/constants'
import { App } from './App.tsx'
import { subscribeStateToGoogleSheets } from './google-sheets'
import { initLocalStorage, subscribeStateToLocalStorage } from './local-storage'

if (import.meta.env.DEV) {
    initLocalStorage()
  }

subscribeStateToGoogleSheets()
console.log(`${PREFIX}state subscribed to Google Sheets`)

subscribeStateToLocalStorage()
console.log(`${PREFIX}state subscribed to localStorage`)

window.onload = (_ev) => {
  console.log(`${PREFIX}window.load event fired`)
  render(<App />, document.getElementById('app') as HTMLElement)
}
  