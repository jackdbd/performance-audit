const PREFIX = '[performance audit] '

const SELECTOR = {
  FORM: 'form[name="Audit"]',
  INJECT_SCRIPT: '#inject-script',
  URL_TO_AUDIT: '#url-to-audit',
  WPT_SCRIPT: '#wpt-script'
}

const SHEET_NAME = {
  COOKIES: 'cookies',
  WPT_RUNTEST_PARAMS: 'WPT /runtest params'
}

const DEFAULT_INITIAL_STATE = {
  cookies: [],
  cookies_for_wpt_runtest: [],
  inject_script: undefined,
  profiles_for_wpt_runtest: [],
  script_lines: [],
  url: undefined
}

function onError(error) {
  const message = error.message || 'got an error with no message'
  console.error(`${PREFIX} error`, error)
  alert(`ERROR: ${message}`)
}

const useState = (initial_state = DEFAULT_INITIAL_STATE) => {
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

function getValueFromSelector(selector) {
  const el = document.querySelector(selector)
  if (!el) {
    throw new Error(`selector ${selector} found no DOM element on the page`)
  }
  return el.value
}

function makeOnGotAllCookies({ setState }) {
  return function onGotAllCookies(arr) {
    console.log(
      `${PREFIX}extracted ${arr.length} cookies from spreadsheet tab ${SHEET_NAME.COOKIES}`
    )
    setState({ cookies: arr })
  }
}

function makeOnGotProfiles({ getState, setState }) {
  return function onGotProfiles(arr) {
    console.log(
      `${PREFIX}extracted ${arr.length} profiles from spreadsheet tab ${SHEET_NAME.WPT_RUNTEST_PARAMS}`
    )

    const { cookies: cookies_with_url, url } = getState()
    const filtered = cookies_with_url.filter((d) => url.includes(d.url))

    setState({
      cookies_for_wpt_runtest: filtered.map((d) => d.cookies),
      profiles_for_wpt_runtest: arr
    })

    const params = getState()

    const array_of_cookies = params.cookies_for_wpt_runtest
    const inject_script = params.inject_script
    const profiles = params.profiles_for_wpt_runtest
    const script_lines = params.script_lines

    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler((result) => {
        const { error_messages, successes } = result

        if (error_messages.length > 0) {
          onError(new Error(error_messages.join('\n')))
          return
        }

        const summary =
          successes.length === 1
            ? 'Launched 1 WPT test'
            : `Launched ${successes.length} WPT tests`

        const test_ids = successes.map((d) => d.testId)

        google.script.run
          .withFailureHandler(onError)
          .showWebPageTestDialog({ summary, test_ids })
      })
      .runtests({
        url,
        array_of_cookies,
        inject_script,
        profiles,
        script_lines
      })
  }
}

function makeOnFormSubmit({ setState, onGotProfiles }) {
  return function onFormSubmit(ev) {
    ev.preventDefault()

    // TODO: briefly show an alert to notify the user? Extracting the WPT
    // profiles from the spreadsheet implies a call to the backend (i.e. Apps
    // Script servers), which takes a couple of seconds. Not showing anything to
    // the user is bad UX. But blocking the execution of the script and wait for
    // the user's is also bad, IMHO.
    console.log(`${PREFIX}form '${SELECTOR.FORM}' submitted`)

    // instantiating a FormData object causes the `formdata` event to fire
    // const formData = new FormData(form_elem)

    let script = getValueFromSelector(SELECTOR.WPT_SCRIPT)

    let script_lines = []
    if (script && script !== '') {
      script_lines = script.split('\n')
    }

    console.log('WPT script lines')
    console.log(script_lines)

    const inject_script = getValueFromSelector(SELECTOR.INJECT_SCRIPT)
    const url = getValueFromSelector(SELECTOR.URL_TO_AUDIT)

    setState({ inject_script, url, script_lines })

    // https://developer.mozilla.org/en-US/docs/Web/CSS/:checked
    const checked = [...document.querySelectorAll('input:checked')]
    const checkboxes_profile = checked.filter((el) =>
      el.id.startsWith('wpt-profile')
    )
    if (checkboxes_profile.length === 0) {
      alert(
        `select at least one WebPageTest profile in the '${SHEET_NAME.WPT_RUNTEST_PARAMS}' spreadsheet tab`
      )
    }

    const profiles = checkboxes_profile.map((el) =>
      parseInt(el.dataset.rowIndex, 10)
    )

    const config_for_url = localStorage.getItem(url)
    console.log(`${PREFIX} got config for ${url} from localStorage`)
    console.log(JSON.parse(config_for_url))

    // WIP: store the WPT script used on this URL to retrieve it later
    localStorage.setItem(url, JSON.stringify({ inject_script, script_lines }))

    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler(onGotProfiles)
      .getWebPageTestProfiles(profiles)
  }
}

window.onload = (_ev) => {
  console.log(`${PREFIX}window.load event fired`)

  const form_elem = document.querySelector(SELECTOR.FORM)
  if (!form_elem) {
    alert(`Selector ${SELECTOR.FORM} found nothing on this page`)
  }

  const { getState, setState } = useState()

  const onGotAllCookies = makeOnGotAllCookies({ setState })
  const onGotProfiles = makeOnGotProfiles({ getState, setState })
  const onFormSubmit = makeOnFormSubmit({ getState, setState, onGotProfiles })

  form_elem.addEventListener('submit', onFormSubmit)

  google.script.run
    .withFailureHandler(onError)
    .withSuccessHandler(onGotAllCookies)
    .getAllCookies()
}

// Required Validation for a group of checkboxes
// https://html.form.guide/checkbox/html-form-checkbox-required/
// https://vyspiansky.github.io/2019/07/13/javascript-at-least-one-checkbox-must-be-selected/
// form_elem.addEventListener("formdata", (ev) => {
//   const formData = ev.formData
//   // formdata gets modified by the formdata event
//   formData.set("email", formData.get("email").toLowerCase())
// })
