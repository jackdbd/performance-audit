import { MENU, SHEET_NAME } from './constants'
import { headersAndRows } from './spreadsheet'

const menuItemOne = () => {
  const ui = SpreadsheetApp.getUi()

  // https://developers.google.com/apps-script/reference/html/html-service.html#createTemplateFromFile(String)
  const template = HtmlService.createTemplateFromFile('sidebar.html')

  const { rows: params_rows } = headersAndRows(SHEET_NAME.WPT_RUNTEST_PARAMS)
  const wpt_profiles = params_rows.map((_row, i) => {
    // +1 because indexes in Google Sheets start at 1, +1 for the headers
    const i_row = i + 2
    return { id: `wpt-profile-${i}`, name: `Row ${i_row}`, 'row-index': i_row }
  })

  template.wpt_profiles_legend = SHEET_NAME.WPT_RUNTEST_PARAMS
  template.wpt_profiles = wpt_profiles

  // https://developers.google.com/apps-script/guides/html/restrictions#restrictions_in_iframe_mode
  const html_output = template.evaluate()

  html_output.setTitle(MENU.ITEM_ONE_CAPTION)
  html_output.setWidth(250)
  html_output.setHeight(300)

  ui.showSidebar(html_output)
}

// const menuItemTwo = () => {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet()

//   // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#toastmsg,-title
//   sheet.toast('Task menu 2 started', 'Status', 5)
// }

export const addCustomMenuToUi = () => {
  const ui = SpreadsheetApp.getUi()

  ui.createMenu(MENU.TITLE)
    .addItem(MENU.ITEM_ONE_CAPTION, 'menuItemOne')
    // .addSeparator()
    // .addSubMenu(ui.createMenu('Sub-menu').addItem('Toast demo', 'menuItemTwo'))
    .addToUi()
}
