import { assert, describe, it, beforeAll } from 'vitest'
import { getByText, getByTestId, fireEvent } from '@testing-library/dom'
import { DEFAULT } from '../src/constants'
import { render } from '../src/app'

describe('app', () => {
  let container
  beforeAll(() => {
    container = document.createElement('div#app')
    container.id = '#app'
    container.innerHTML = render()
  })

  it('contains a form', () => {
    assert.isTrue(container.innerHTML.includes('form'))
  })

  it('contains a submit button', () => {
    const submit_button = getByText(container, 'Run query')
    // submit_button.click()
    assert.isNotNull(submit_button)
  })

  it('contains a input for the CrUX origin', () => {
    const input = getByTestId(container, 'crux-url')
    const url = 'https://www.example.com'

    assert.equal(input.value, DEFAULT.ORIGIN)
    fireEvent.change(input, { target: { value: url } })
    assert.equal(input.value, url)
  })
})
