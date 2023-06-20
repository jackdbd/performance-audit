/**
 * Retrieves the OpenAI API key from your script project settings.
 *
 * @return {string} Your OpenAI API key.
 * @see {@link https://platform.openai.com/account/api-keys}
 */
export const GET_OPENAI_API_KEY = () => {
  return PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')
}

/**
 * Retrieves the top headlines.
 *
 * @customFunction
 */
export const GET_HEADLINES = () => {
  const api_key =
    PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')

  const url = 'https://api.openai.com/v1/chat/completions'

  const content = 'Give me 10 top headlines from around the world'

  const payload = {
    messages: [{ role: 'user', content }],
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  }

  const options = {
    method: 'post' as GoogleAppsScript.URL_Fetch.HttpMethod,
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${api_key}`
    },
    payload: JSON.stringify(payload)
  }

  const response = UrlFetchApp.fetch(url, options)

  const result = JSON.parse(response.getContentText())
  // console.log(`result`, result);
  const cell_content = result.choices[0].message.content
  // console.log(`result.choices`, result.choices);
  console.log(`cell_content`, cell_content)

  const sheet = SpreadsheetApp.getActiveSheet()
  sheet.getRange('A20').setValue(cell_content)
}
