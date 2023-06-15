import { afterAll, assert, beforeAll, describe, it, vi } from 'vitest'
import { GET_OPENAI_API_KEY } from '../src/openai'
import { PropertiesService } from './stubs.mjs'

describe('GET_OPENAI_API_KEY', () => {
  beforeAll(() => {
    vi.stubGlobal('PropertiesService', PropertiesService)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns the expected value for the property', () => {
    const expected = 'the value of the script property OPENAI_API_KEY is xyz'

    assert.equal(GET_OPENAI_API_KEY(), expected)
  })
})
