import { SHEET_NAME } from './constants'
import { GET_WPT_RUNTEST_CELLS } from './spreadsheet'

const menuItemOne = () => {
  const ui = SpreadsheetApp.getUi()
  const sheet = SpreadsheetApp.getActiveSpreadsheet()

  // https://developers.google.com/apps-script/guides/dialogs
  // https://developers.google.com/apps-script/reference/base/ui#prompt(String)

  // const title = "Let's get to know each other!"
  // const response = ui.prompt(
  //   title,
  //   'Please enter your name:',
  //   ui.ButtonSet.OK_CANCEL
  // )

  // const button = response.getSelectedButton()
  // const text = response.getResponseText()
  // if (button == ui.Button.OK) {
  //   ui.alert(`Your name is ${text}`)
  // } else if (button == ui.Button.CANCEL) {
  //   ui.alert("I didn't get your name.")
  // } else if (button == ui.Button.CLOSE) {
  //   // User clicked X in the title bar.
  //   ui.alert('You closed the dialog.')
  // }

  // https://developers.google.com/apps-script/reference/html/html-output.html
  // const html = '<p>A change of speed, a change of style...</p>'
  // const html_output = HtmlService.createHtmlOutput(html)
  //   .setWidth(250)
  //   .setHeight(300)

  // https://developers.google.com/apps-script/reference/html/html-service.html#createTemplateFromFile(String)
  const template = HtmlService.createTemplateFromFile('sidebar.html')

  const { rows: params_rows } = headersAndRows(SHEET_NAME.WPT_RUNTEST_PARAMS)
  const wpt_profiles = params_rows.map((row, i) => {
    // +1 because indexes in Google Sheets start at 1, +1 for the headers
    const i_row = i + 2
    // console.log(`=== profile ${i} ===`, row)
    // sheet.toast(JSON.stringify(row, null, 2), `WPT profile ${i}`, 3)
    return { id: `wpt-profile-${i}`, name: `Row ${i_row}`, 'row-index': i_row }
  })

  const { rows: cookies_rows } = headersAndRows(SHEET_NAME.COOKIES)
  const wpt_cookies = cookies_rows.map((row, i) => {
    const i_row = i + 2
    // sheet.toast(JSON.stringify(row, null, 2), `cookie ${i}`, 3)
    return { id: `wpt-cookie-${i}`, name: `Row ${i_row}`, 'row-index': i_row }
  })

  template.answer = 42
  template.things = ['foo', 'bar', 'baz']

  template.wpt_profiles_legend = SHEET_NAME.WPT_RUNTEST_PARAMS
  template.wpt_profiles = wpt_profiles

  template.wpt_cookies_legend = SHEET_NAME.COOKIES
  template.wpt_cookies = wpt_cookies

  // https://developers.google.com/apps-script/guides/html/restrictions#restrictions_in_iframe_mode
  const html_output = template.evaluate()

  // https://developers.google.com/apps-script/reference/base/ui#showSidebar(Object)
  html_output.setTitle('Performance Audit sidebar')
  ui.showSidebar(html_output)

  // https://developers.google.com/apps-script/reference/base/ui#showModalDialog(Object,String)
  // ui.showModalDialog(html_output, 'My add-on')

  // ui.alert('You clicked the first menu item!')

  // const params_cells = GET_WPT_RUNTEST_CELLS()
  // Browser.msgBox('WPT Params', JSON.stringify(params_cells), Browser.Buttons.OK)
}

const menuItemTwo = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()

  // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#toastmsg,-title
  sheet.toast('Task menu 2 started', 'Status', 5)
}

export const addPerformanceAuditMenuToUi = () => {
  const ui = SpreadsheetApp.getUi()

  ui.createMenu('Performance Audit')
    .addItem('Show sidebar', 'menuItemOne')
    .addSeparator()
    .addSubMenu(ui.createMenu('Sub-menu').addItem('Toast demo', 'menuItemTwo'))
    .addToUi()
}
