import './style.css'
import { PREFIX } from '../../shared/src/constants'
import { onError } from '../../shared/src/utils'
import { SELECTOR } from './constants'
import { render } from './app'

interface Success {
  message: string
}

function onSuccess(value: Success) {
  // https://developers.google.com/apps-script/guides/html/reference/host
  google.script.host.close()
  console.log(`${PREFIX}${value.message}`)
  // alert(`SUCCESS! ${JSON.stringify(value, null, 2)}`)
}

function onSubmit(ev: Event) {
  ev.preventDefault()

  // a form submit is an installable trigger
  // https://developers.google.com/apps-script/guides/triggers/events#form-submit
  // https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onFormSubmit()
  // https://youtu.be/vYQE9ltt2Yg

  // TODO: if I create an installable trigger for the form submit, there should
  // be no need to call `google.script.run` from the frontend, and the backend
  // would automatically receive the data from the form.

  const el_crux_url = document.querySelector(
    SELECTOR.CRUX_URL
  ) as HTMLInputElement | null
  if (!el_crux_url) {
    return
  }

  const el_crux_form_factor = document.querySelector(
    SELECTOR.CRUX_FORM_FACTOR
  ) as HTMLSelectElement | null
  if (!el_crux_form_factor) {
    return
  }

  const options = {
    url: el_crux_url.value,
    form_factor: el_crux_form_factor.value
  }

  if (import.meta.env.DEV) {
    console.log('dev')
    console.log('url value', el_crux_url.value)
    console.log('form factor value', el_crux_form_factor.value)
    // TODO: use dotenv to load the CrUX API as env variable
    // https://vitejs.dev/guide/env-and-mode.html
  } else {
    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler(onSuccess)
      .callCrUXHistoryAPI(options)
  }
}

window.onload = (_ev) => {
  console.log(`${PREFIX}window.load event fired`)

  const root = document.querySelector(SELECTOR.APP)
  if (!root) {
    alert(`Selector ${SELECTOR.APP} found nothing on this page`)
    return
  }
  root.innerHTML = render()

  const form_elem = document.querySelector(SELECTOR.FORM)
  if (!form_elem) {
    alert(`Selector ${SELECTOR.FORM} found nothing on this page`)
    return
  }

  form_elem.addEventListener('submit', onSubmit)
}
