import './style.css'
import { DEFAULT, PREFIX } from '../../shared/src/constants'
import type { CruxHistoryAPIOptions } from '../../shared/src/interfaces'
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

function getFormDataAndCallBackend(form: HTMLFormElement) {
  const form_data = new FormData(form)

  const options: Required<CruxHistoryAPIOptions> = {
    form_factor: DEFAULT.FORM_FACTOR,
    url: DEFAULT.URL
  }

  for (const [name, val] of form_data.entries()) {
    if (name === 'crux-url') {
      options.url = val as string
    } else if (name === 'crux-form-factor') {
      options.form_factor = val as string
    } else {
      alert(`TODO: implement form field ${name}`)
    }
  }

  if (import.meta.env.DEV) {
    console.log(
      `${PREFIX}skip calling CrUX History API in development`,
      options
    )
    // TODO: use dotenv to load the CrUX API key as env variable
    // https://vitejs.dev/guide/env-and-mode.html
  } else {
    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler(onSuccess)
      .callCrUXHistoryAPI(options)
  }
}

function onSubmit(ev: Event) {
  // ev.preventDefault()

  getFormDataAndCallBackend(ev.target as HTMLFormElement)

  // a form submit is an installable trigger
  // https://developers.google.com/apps-script/guides/triggers/events#form-submit
  // https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onFormSubmit()
  // https://youtu.be/vYQE9ltt2Yg

  // TODO: if I create an installable trigger for the form submit, there should
  // be no need to call `google.script.run` from the frontend, and the backend
  // would automatically receive the data from the form.
}

window.onload = (_ev) => {
  // console.log(`${PREFIX}window.load event fired`)

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
