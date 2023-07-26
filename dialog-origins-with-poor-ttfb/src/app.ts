import { CRUX_QUERY_POOR_TTFB, DEFAULT } from '../../shared/src/constants'
import { getPreviousNMonths } from '../../shared/src/utils'
import { FORM_NAME, TEST_ID } from './constants'

export const render = () => {
  const yyyymm = getPreviousNMonths(1)[0]

  return `
  <div>
    <p>Query the <a href="https://developer.chrome.com/docs/crux/bigquery/">CrUX BigQuery dataset</a> to discover origins with a poor TTFB.</p>
    <form class="" name="${FORM_NAME}" method="POST" action="">
      <fieldset>
        <legend>Query parameters</legend>
        <p>Parameters for the <a href="https://cloud.google.com/bigquery/docs/parameterized-queries">BigQuery parameterized query</a>.</p>

        <p><code>@country_code</code></p>
        <input id="crux-country-code" name="crux-country-code" required title="The country code to search in CrUX" value="${DEFAULT.COUNTRY_CODE}" data-testid="${TEST_ID.INPUT_CRUX_COUNTRY_CODE}">

        <p><code>@form_factor</code></p>
        <input id="crux-form-factor" name="crux-form-factor" required title="The form factor to search in CrUX" value="${DEFAULT.FORM_FACTOR}" data-testid="${TEST_ID.INPUT_CRUX_FORM_FACTOR}">

        <p><code>@yyyymm</code></p>
        <input type="text" id="${yyyymm}" name="yyyymm" required value="${yyyymm}">
      </fieldset>

      <fieldset>
        <legend>BigQuery Job Options</legend>
        <p>Configuration options for the <a href="https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#jobconfigurationquery">BigQuery query job</a>.</p>

        <p><code>maximumBytesBilled</code></p>
        <input id="maximum-bytes-billed" name="maximum-bytes-billed" type="number" min="0" step="1000000000" value="${DEFAULT.MAXIMUM_BYTES_BILLED}">

        <p><code>timeoutMs</code></p>
        <input id="timeout-ms" name="timeout-ms" type="number" min="1000" step="1000" value="${DEFAULT.QUERY_TIMEOUT_MS}">
      </fieldset>

      <button class="action" name="submit" type="submit" data-testid="${TEST_ID.FORM_SUBMIT_BUTTON}">Submit</button>
    </form>

    <p>Upon form submission, the following query will be executed using the provided parameters.</p>
    <pre><code>${CRUX_QUERY_POOR_TTFB}</code></pre>
  </div>
`
}
