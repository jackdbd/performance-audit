import { addCustomMenuToUi } from './menu'
import { logJSON } from './utils'

/**
 * Trigger that runs when this Google Sheets is opened.
 *
 * @return {void}
 * @see {@link https://developers.google.com/apps-script/guides/triggers Simple Triggers}
 */
const onOpen = (_ev: GoogleAppsScript.Events.SheetsOnOpen) => {
  addCustomMenuToUi()
  logJSON({
    message: 'added custom menu to Google Sheets UI',
    tags: ['sheets', 'trigger', 'ui']
  })
}
