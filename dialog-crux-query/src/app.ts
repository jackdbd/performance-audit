import {
  CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY,
  DEFAULT
} from '../../shared/src/constants'
import { getPreviousNMonths } from '../../shared/src/utils'
import { TEST_ID } from './constants'

export const render = () => {
  return `
  <div>
    <p>Query the <a href="https://developer.chrome.com/docs/crux/bigquery/">CrUX BigQuery dataset</a> to discover device and connectivity, grouped by country.</p>
    <form class="" name="CrUX query" method="POST" action="">
      <fieldset>
        <legend>Query parameters</legend>
        <p>Parameters for the <a href="https://cloud.google.com/bigquery/docs/parameterized-queries">BigQuery parameterized query</a>.</p>

        <p><code>@url</code></p>
        <input id="crux-url" name="crux-url" required title="The URL to search in CrUX" type="url" value="${
          DEFAULT.URL
        }" data-testid="${TEST_ID.INPUT_CRUX_URL}">

        <p><code>@months</code></p>
        <ul class="cluster" data-align="start">
        ${getPreviousNMonths(3)
          .map((yyyymm, i) => {
            return `
            <li>
              <input type="text" id="${yyyymm}" name="month-${i}" required value="${yyyymm}">
            </li>`
          })
          .join('')}
        </ul>
      </fieldset>

      <fieldset>
        <legend>BigQuery Job Options</legend>
        <p>Configuration options for the <a href="https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#jobconfigurationquery">BigQuery query job</a>.</p>

        <p><code>maximumBytesBilled</code></p>
        <input id="maximum-bytes-billed" name="maximum-bytes-billed" type="number" min="0" step="1000000000" value="${
          DEFAULT.MAXIMUM_BYTES_BILLED
        }">

        <p><code>timeoutMs</code></p>
        <input id="timeout-ms" name="timeout-ms" type="number" min="1000" step="1000" value="${
          DEFAULT.QUERY_TIMEOUT_MS
        }">
      </fieldset>

      <button class="action" name="submit" type="submit" data-testid="${
        TEST_ID.FORM_SUBMIT_BUTTON
      }">Submit</button>
    </form>

    <p>Upon form submission, the following query will be executed using the provided parameters.</p>
    <pre><code>${CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY}</code></pre>
  </div>
`
}
