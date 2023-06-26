const PREFIX = '[performance audit] '

const SHEET_NAME = {
  COOKIES: 'cookies',
  WPT_RUNTEST_PARAMS: 'WPT /runtest params'
}

const onError = (error) => {
  const message = error.message || 'got an error with no message'
  console.error(`${PREFIX} error`, error)
  alert(`ERROR: ${message}`)
}

const useState = (initial_state = {}) => {
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
    setState: (chunk) => {
      const old = __state
      // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
      __state = structuredClone({ ...old, ...chunk })
      console.group(`${PREFIX} setState`)
      console.table({ old, chunk, new: __state })
      console.groupEnd()
    }
  }
}
