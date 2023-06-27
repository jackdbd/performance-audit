import { assert, describe, it, beforeAll } from 'vitest'
 import { fireEvent, getByTestId, render } from '@testing-library/preact'
import { App } from '../src/App'

describe('App', () => {
  let container
  beforeAll(() => {
    const render_result = render(<App />)
    container = render_result.container
  })

  it('contains a form', () => {
    assert.isTrue(container.innerHTML.includes('form'))
  })

  it('contains a submit button', () => {
    const submit_button = getByTestId(container, 'submit-button')
    assert.isNotNull(submit_button)
  })

  it('contains a input for the URL to audit', () => {
    const input = getByTestId(container, 'url-to-audit')
    const url = 'https://www.example.com'

    assert.notEqual(input.value, url)
    fireEvent.change(input, { target: { value: url } })
    assert.equal(input.value, url)
  })
})
