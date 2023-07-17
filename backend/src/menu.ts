export const menuItemWebPageTest = () => {
  const html_output = HtmlService.createHtmlOutputFromFile(
    'sidebar-wpt/index.html'
  )
    .setTitle('WebPageTest')
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

export const menuItemDeviceAndConnectivityByCountry = () => {
  const html_output = HtmlService.createHtmlOutputFromFile(
    'dialog-crux-query/index.html'
  )
    .setWidth(800)
    .setHeight(600)

  SpreadsheetApp.getUi().showModalDialog(
    html_output,
    'Device and connectivity by country'
  )
}

export const menuItemFieldPerformance = () => {
  const html_output = HtmlService.createHtmlOutputFromFile(
    'dialog-crux-history/index.html'
  )
    .setWidth(600)
    .setHeight(400)

  SpreadsheetApp.getUi().showModalDialog(html_output, 'Field performance')
}

export const addCustomMenuToUi = () => {
  SpreadsheetApp.getUi()
    .createMenu('Performance Audit')
    .addItem(
      'Device and connectivity by country',
      'menuItemDeviceAndConnectivityByCountry'
    )
    .addItem('Field performance', 'menuItemFieldPerformance')
    .addItem('WebPageTest', 'menuItemWebPageTest')
    .addToUi()
}
