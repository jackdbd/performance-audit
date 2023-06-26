const PREFIX = '[performance audit] '

const SELECTOR = {
  FORM: 'form[name="CrUX query"]'
}

function onError(error) {
  const message = error.message || 'got an error with no message'
  console.error(`${PREFIX} error`, error)
  alert(`ERROR: ${message}`)
}

function onSuccess(value) {
  alert(`SUCCESS! ${JSON.stringify(value, null, 2)}`)
}

function onSubmit(ev) {
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

  const form_elem = document.querySelector(SELECTOR.FORM)
  if (!form_elem) {
    alert(`Selector ${SELECTOR.FORM} found nothing on this page`)
  }

  form_elem.addEventListener('submit', onSubmit)
}
