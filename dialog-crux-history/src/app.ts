import { DEFAULT } from '../../shared/src/constants'
import { FORM_NAME, TEST_ID } from './constants'

export const render = () => {
  return `
  <div>
    <p>Call the <a href="https://developer.chrome.com/docs/crux/history-api/">CrUX History API</a> to retrieve field performance data up to the last six month.</p>
    <form class="" name="${FORM_NAME}" method="POST" action="">
      <p><b>url</b></p>
      <input name="crux-url" id="crux-url" required title="The URL to search in CrUX" type="url" value="${DEFAULT.URL}" data-testid="${TEST_ID.CRUX_URL}">

      <p><b>Form Factor</b></p>
      <select name="crux-form-factor" id="crux-form-factor" data-testid="${TEST_ID.CRUX_FORM_FACTOR}">
        <option value="PHONE">PHONE</option>
        <option value="DESKTOP">DESKTOP</option>
        <option value="TABLET">TABLET</option>
        <option value="AGGREGATED">AGGREGATED</option>
      </select>

      <button class="action" name="submit" type="submit" data-testid="${TEST_ID.FORM_SUBMIT_BUTTON}">Submit</button>
    </form>
  </div>
`
}
