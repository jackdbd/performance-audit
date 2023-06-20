const PREFIX = '[performance audit] '
const SELECTOR = {
  FORM: 'form[name="Audit"]',
  URL_TO_AUDIT: '#url-to-audit'
}

const SHEET_NAME = {
  COOKIES: 'cookies',
  WPT_INFO: 'WPT info',
  WPT_RUNTEST_PARAMS: 'WPT /runtest params'
}

function onError(error) {
  const message = error.message || 'got an error with no message'
  console.error('=== ERROR ===', error)
  alert(`ERROR: ${message}`)
}

const useState = () => {
  let __state = {
    cookies: [],
    cookies_for_wpt_runtest: [],
    profiles_for_wpt_runtest: [],
    url: ''
  }
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

function getUrlToAudit() {
  const input = document.querySelector(SELECTOR.URL_TO_AUDIT)
  if (!input) {
    throw new Error(
      `selector ${SELECTOR.URL_TO_AUDIT} found nothing on the page`
    )
  }
  return input.value
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
    const profiles = params.profiles_for_wpt_runtest

    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler((tests) => {
        const summary =
          tests.length === 1
            ? 'Launched 1 WPT test'
            : `Launched ${tests.length} WPT tests`

        const arr = [summary]
        if (tests.length > 0) {
          const ids = tests.map((t) => t.testId)
          arr.push(`TEST IDs: ${ids.join(', ')}`)
        }
        google.script.run.displayStatusMessage({ message: arr.join('.\n') })
      })
      .runtests({ url, array_of_cookies, profiles })
  }
}

function makeOnFormSubmit({ getState, setState, onGotProfiles }) {
  return function onFormSubmit(ev) {
    console.log(`${PREFIX}form '${SELECTOR.FORM}' submitted`)

    ev.preventDefault()
    const method = ev.target.method

    // instantiating a FormData object causes the `formdata` event to fire
    // const formData = new FormData(form_elem)

    setState({ url: getUrlToAudit() })

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

    // google.script.run.displayStatusMessage({
    //   message: `Submitting tests to WebPageTest`
    // })

    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler(onGotProfiles)
      .getWebPageTestProfiles(profiles)
  }
}

window.onload = (ev) => {
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
//   formData.set("name", formData.get("name").toLowerCase())
//   formData.set("email", formData.get("email").toLowerCase())
//   formData.set("message", formData.get("message"))
// })
