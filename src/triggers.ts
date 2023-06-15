import { addPerformanceAuditMenuToUi } from './menu'

/**
 * Trigger that runs when this Google Sheets is opened.
 *
 * @return {void}
 * @see {@link https://developers.google.com/apps-script/guides/triggers Simple Triggers}
 */
const onOpen = (_ev: GoogleAppsScript.Events.SheetsOnOpen) => {
  addPerformanceAuditMenuToUi()

  // https://developers.google.com/apps-script/reference/base/browser
  // const message = JSON.stringify(_ev, null, 2)
  // Browser.msgBox('OnOpen Event', message, Browser.Buttons.OK)

  // const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  // const sheet = spreadsheet.insertSheet('My New Sheet')

  // https://stackoverflow.com/questions/28377573/can-you-programmatically-generate-buttons-in-google-sheets-cells
  // const cell = sheet.getRange('B5')
  // cell.setFormula(`=HYPERLINK("www.google.com", "Search the web")`)

  // const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // sheet.appendRow(['foo', 'bar'])
  // sheet.appendRow([123, 456, 789])
}
