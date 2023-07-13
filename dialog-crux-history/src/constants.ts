export const FORM_NAME = 'CrUX queryHistoryRecord'

export const DEFAULT = {
  FORM_FACTOR: undefined,
  URL: 'https://web.dev/ttfb/'
}

export const SELECTOR = {
  APP: '#app',
  CRUX_FORM_FACTOR: '#crux-form-factor',
  CRUX_URL: '#crux-url',
  FORM: `form[name="${FORM_NAME}"]`
}

export const TEST_ID = {
  CRUX_FORM_FACTOR: 'crux-form-factor',
  CRUX_URL: 'crux-url',
  FORM_SUBMIT_BUTTON: 'submit-button'
}
