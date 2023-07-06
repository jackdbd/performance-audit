import { assert, describe, it } from 'vitest'
import { CRUX_QUERY } from '../src/constants'

describe('CRUX_QUERY', () => {
  it('contains a Common Table Expression', () => {
    assert.isTrue(CRUX_QUERY.includes('cte'))
  })

  it('contains a @url query parameter', () => {
    assert.isTrue(CRUX_QUERY.includes('@url'))
  })

  it('contains a @months query parameter', () => {
    assert.isTrue(CRUX_QUERY.includes('@months'))
  })
})
