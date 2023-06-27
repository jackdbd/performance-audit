import { MENU } from './constants'

export const menuItemWPTSidebar = () => {
  const html_output = HtmlService.createHtmlOutputFromFile(
    'sidebar-wpt/index.html'
  )
    .setTitle(MENU.ITEM_ONE_CAPTION)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)

  // Apps Script uses iframes to sandbox custom user interfaces (like this sidebar) for Google Docs, Sheets, and Forms.
  // https://developers.google.com/apps-script/guides/html/restrictions#restrictions_in_iframe_mode
  // Unfortunately, it is not possible to resize sidebars.
  // https://developers.google.com/apps-script/guides/html/communication#resizing_dialogs_in_applications

  SpreadsheetApp.getUi().showSidebar(html_output)
}

export const menuItemCrUXDialog = () => {
  const html_output = HtmlService.createHtmlOutputFromFile(
    'dialog-crux-query/index.html'
  )
    .setWidth(800)
    .setHeight(600)

  SpreadsheetApp.getUi().showModalDialog(
    html_output,
    'Query the BigQuery CrUX dataset'
  )
}

export const addCustomMenuToUi = () => {
  SpreadsheetApp.getUi()
    .createMenu(MENU.TITLE)
    .addItem(MENU.ITEM_ONE_CAPTION, 'menuItemWPTSidebar')
    .addItem(MENU.ITEM_TWO_CAPTION, 'menuItemCrUXDialog')
    .addToUi()
}
