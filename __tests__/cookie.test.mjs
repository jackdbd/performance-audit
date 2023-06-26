import { assert, describe, it } from 'vitest'
import { DECODE_COOKIE } from '../backend/cookie'

describe('DECODE_COOKIE', () => {
  it('decodes the Iubenda cookie as expected', () => {
    const encoded =
      '%7B%22timestamp%22%3A%222023-06-08T16%3A27%3A42.167Z%22%2C%22version%22%3A%221.48.0%22%2C%22purposes%22%3A%7B%221%22%3Atrue%2C%222%22%3Atrue%2C%224%22%3Atrue%2C%225%22%3Atrue%7D%2C%22id%22%3A26569333%7D'

    const expected = JSON.stringify(
      {
        timestamp: '2023-06-08T16:27:42.167Z',
        version: '1.48.0',
        purposes: { 1: true, 2: true, 4: true, 5: true },
        id: 26569333
      },
      null,
      2
    )

    assert.equal(DECODE_COOKIE(encoded), expected)
  })
})
