import { assert, describe, it } from 'vitest'
import { SELECTOR } from '../src/constants'

describe('SELECTOR', () => {
  it('contains the expected fields', () => {
    assert.containsAllKeys(SELECTOR, ['FORM', 'URL_TO_AUDIT'])
  })
})
