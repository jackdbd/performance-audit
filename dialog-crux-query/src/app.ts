import { getPreviousNMonths } from '../../shared/src/utils'
import { DEFAULT, CRUX_QUERY } from './constants'

export const render = () => {
  return `
  <div>
    <form class="" name="CrUX query" method="POST" action="">
      <fieldset>
        <legend>Query parameters</legend>
        <p>Parameters for the <a href="https://cloud.google.com/bigquery/docs/parameterized-queries">BigQuery parameterized query</a>.</p>

        <p><code>@url</code></p>
        <input id="crux-url" name="crux-url" required title="The URL to search in CrUX" type="url" value="${
          DEFAULT.ORIGIN
        }" data-testid="crux-url">

        <p><code>@months</code></p>
        <ul class="cluster" data-align="start">
        ${getPreviousNMonths(3)
          .map((yyyymm) => {
            return `
            <li>
              <input type="text" id="${yyyymm}" name="${yyyymm}" required value="${yyyymm}">
            </li>`
          })
          .join('')}
        </ul>
      </fieldset>

      <fieldset>
        <legend>BigQuery Job Options</legend>
        <p>Configuration options for the <a href="https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#jobconfigurationquery">BigQuery query job</a>.</p>

        <p><code>maximumBytesBilled</code></p>
        <input id="maximum-bytes-billed" name="maximum-bytes-billed" type="number" min="0" step="1000000000" value="12000000000">
      </fieldset>

      <button class="action" name="submit" type="submit" data-testid="submit-button">Run query</button>
    </form>

    <p>Upon form submission, the following query will be executed using the provided parameters.</p>
    <pre><code>${CRUX_QUERY}</code></pre>
  </div>
`
}
