import { assert, describe, it, beforeAll } from 'vitest'
import { getByTestId, fireEvent } from '@testing-library/dom'
import { DEFAULT, SELECTOR, TEST_ID } from '../src/constants'
import { render } from '../src/app'

describe('app', () => {
  let container
  beforeAll(() => {
    container = document.createElement('div')
    container.id = SELECTOR.APP
    container.innerHTML = render()
  })

  it('contains a form', () => {
    assert.isTrue(container.innerHTML.includes('form'))
  })

  it('contains a submit button', () => {
    const submit_button = getByTestId(container, 'submit-button')
    assert.isNotNull(submit_button)
  })

  it('contains a input for the URL', () => {
    const input = getByTestId(container, TEST_ID.CRUX_URL)
    const url = 'https://www.example.com'

    assert.equal(input.value, DEFAULT.URL)
    fireEvent.change(input, { target: { value: url } })
    assert.equal(input.value, url)
  })

  it('contains a select for the form factor', () => {
    const select = getByTestId(container, TEST_ID.CRUX_FORM_FACTOR)

    assert.equal(select.value, 'PHONE')
    fireEvent.change(select, { target: { value: 'TABLET' } })
    assert.equal(select.value, 'TABLET')
  })
})
