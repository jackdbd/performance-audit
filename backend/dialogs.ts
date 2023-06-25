export interface ShowWebPageTestDialogConfig {
  summary: string
  test_ids: string[]
}

/**
 * Shows a custom dialog.
 *
 * @param {Object} config - A configuration object with summary, test IDs.
 * @return {void}
 * @see {@link https://developers.google.com/apps-script/guides/dialogs#custom_dialogs Custom dialogs}
 * @customFunction
 */
export const showWebPageTestDialog = ({
  summary,
  test_ids
}: ShowWebPageTestDialogConfig) => {
  const template = HtmlService.createTemplateFromFile('dialog-wpt-tests.html')

  template.summary = summary
  template.test_ids = test_ids

  const html_output = template.evaluate().setWidth(400).setHeight(300)

  SpreadsheetApp.getUi().showModalDialog(html_output, 'WebPageTest tests')
}
