import { assert, describe, it, beforeAll } from 'vitest'
import { getByText, getByTestId, fireEvent } from '@testing-library/dom'
import { DEFAULT } from '../../shared/src/constants'
import { render } from '../src/app'
import { TEST_ID } from '../src/constants'

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
    const submit_button = getByText(container, 'Submit')
    assert.isNotNull(submit_button)
  })

  it('contains a input for the CrUX URL', () => {
    const input = getByTestId(container, TEST_ID.INPUT_CRUX_URL)

    assert.equal(input.value, DEFAULT.URL)

    const url = 'https://www.example.com'
    fireEvent.change(input, { target: { value: url } })
    assert.equal(input.value, url)
  })
})
