import './style.css'
import { PREFIX } from '../../shared/src/constants'
import { onError } from '../../shared/src/utils'
import { SELECTOR } from './constants'
import { render } from './app'

function onSuccess(value: any) {
  alert(`SUCCESS! ${JSON.stringify(value, null, 2)}`)
}

function onSubmit(ev: Event) {
  // alert(`TODO: implement form submit`)
  ev.preventDefault()

  // a form submit is an installable trigger
  // https://developers.google.com/apps-script/guides/triggers/events#form-submit
  // https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onFormSubmit()
  // https://youtu.be/vYQE9ltt2Yg

  // TODO: if I create an installable trigger for the form submit, there should
  // be no need to call `google.script.run` from the frontend, and the backend
  // would automatically receive the data from the form.
  const options = {
    url: 'https://www.vino.com',
    maximum_bytes_billed: 15_000_000_000
  }

  google.script.run
    .withFailureHandler(onError)
    .withSuccessHandler(onSuccess)
    .runQueryOnCrux(options)
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
