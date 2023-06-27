import { addCustomMenuToUi } from './menu'
import { logJSON } from './utils'

/**
 * Trigger that runs when this Google Sheets is opened.
 *
 * @return {void}
 * @see {@link https://developers.google.com/apps-script/guides/triggers Simple Triggers}
 */
function onOpen(_ev: GoogleAppsScript.Events.SheetsOnOpen) {
  addCustomMenuToUi()
  logJSON({
    message: 'added custom menu to Google Sheets UI',
    tags: ['sheets', 'trigger', 'onOpen']
  })
}

// function onEdit(ev: GoogleAppsScript.Events.SheetsOnEdit) {
//   const payload = JSON.stringify(ev, null, 2)
//   logJSON({
//     message: 'edited cell in Google Sheets',
//     tags: ['sheets', 'trigger', 'onEdit'],
//     payload
//   })
// }
