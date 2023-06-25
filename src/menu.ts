import { MENU, SHEET_NAME } from './constants'
import { headersAndRows } from './spreadsheet'

const menuItemOne = () => {
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

  // Apps Script uses iframes to sandbox custom user interfaces (like this sidebar) for Google Docs, Sheets, and Forms.
  // https://developers.google.com/apps-script/guides/html/restrictions#restrictions_in_iframe_mode
  // Unfortunately, it is not possible to resize sidebars.
  // https://developers.google.com/apps-script/guides/html/communication#resizing_dialogs_in_applications
  const html_output = template
    .evaluate()
    .setTitle(MENU.ITEM_ONE_CAPTION)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)

  SpreadsheetApp.getUi().showSidebar(html_output)
}

export const addCustomMenuToUi = () => {
  SpreadsheetApp.getUi()
    .createMenu(MENU.TITLE)
    .addItem(MENU.ITEM_ONE_CAPTION, 'menuItemOne')
    .addToUi()
}
