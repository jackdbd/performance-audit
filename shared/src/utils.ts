import { PREFIX } from './constants'

/**
 * Renders an error message in the DOM, in the currently open dialog or sidebar.
 *
 * @see{@link https://developers.google.com/apps-script/guides/html/reference/host Class google.script.run}
 */
export const onError = (error: any) => {
  const summary = error.message || 'got an error with no message'

  // alert(`ERROR: ${message}`)
  // google.script.host.close()

  const root = document.querySelector('#app')
  if (!root) {
    alert(`Selector #app found nothing on this page`)
    return
  }

  root.innerHTML = `
  <div class="error">
    <h3>Error from Apps Script server</h3>
    <p><code>${summary}</code></p>
  </div>
`
}

export const useState = (initial_state = {}) => {
  let __state = initial_state
  console.group(`${PREFIX} initial state`)
  console.table({ state: initial_state })
  console.groupEnd()

  return {
    getState: () => {
      console.group(`${PREFIX} getState`)
      console.table({ state: __state })
      console.groupEnd()
      return __state
    },
    setState: (chunk: any) => {
      const old = __state
      // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
      __state = structuredClone({ ...old, ...chunk })
      console.group(`${PREFIX} setState`)
      console.table({ old, chunk, new: __state })
      console.groupEnd()
    }
  }
}

export const getPreviousNMonths = (n: number): string[] => {
  const d = new Date()
  const arr: string[] = []

  for (let i = 0; i < n; i++) {
    let month = d.getMonth() - i
    let year = d.getFullYear()

    if (month < 0) {
      month += 12
      year -= 1
    }

    const mm = `${month}`.padStart(2, '0')
    arr.push(`${year}${mm}`)
  }

  return arr
}
