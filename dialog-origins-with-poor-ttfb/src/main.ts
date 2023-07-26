import './style.css'
import { DEFAULT, PREFIX } from '../../shared/src/constants'
import type { CruxBigQueryPoorTTFBOptions } from '../../shared/src/interfaces'
import { onError } from '../../shared/src/utils'
import { SELECTOR } from './constants'
import { render } from './app'

interface Success {
  message: string
}

function getFormDataAndCallBackend(form: HTMLFormElement) {
  const form_data = new FormData(form)

  const options: Required<CruxBigQueryPoorTTFBOptions> = {
    country_code: DEFAULT.COUNTRY_CODE,
    form_factor: DEFAULT.FORM_FACTOR,
    maximum_bytes_billed: DEFAULT.MAXIMUM_BYTES_BILLED,
    query_timeout_ms: DEFAULT.QUERY_TIMEOUT_MS,
    yyyymm: DEFAULT.YYYYMM
  }

  for (const [name, val] of form_data.entries()) {
    if (name.startsWith('yyyymm')) {
      options.yyyymm = parseInt(val as string, 10)
    } else if (name === 'crux-country-code') {
      options.country_code = val as string
    } else if (name === 'crux-form-factor') {
      options.form_factor = (val as string).toLowerCase()
    } else if (name === 'maximum-bytes-billed') {
      options.maximum_bytes_billed = parseInt(val as string, 10)
    } else if (name === 'timeout-ms') {
      options.query_timeout_ms = parseInt(val as string, 10)
    } else {
      alert(`TODO: implement form field ${name}`)
    }
  }

  if (import.meta.env.DEV) {
    console.log(
      `${PREFIX}skip querying CrUX BigQuery dataset in development`,
      options
    )
  } else {
    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler(onSuccess)
      .runQueryPoorTTFBOnCrux(options)
  }
}

function onSuccess(value: Success) {
  // https://developers.google.com/apps-script/guides/html/reference/host
  google.script.host.close()
  // alert(`SUCCESS! ${JSON.stringify(value, null, 2)}`)
  console.log(`${PREFIX}${value.message}`)
}

function onSubmit(ev: Event) {
  // alert(`TODO: implement form submit`)
  ev.preventDefault()

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
