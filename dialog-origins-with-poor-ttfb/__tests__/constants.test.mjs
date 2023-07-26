import { assert, describe, it } from 'vitest'
import { CRUX_QUERY_POOR_TTFB as SQL } from '../../shared/src/constants'

describe('CRUX_QUERY_POOR_TTFB', () => {
  it('contains a Common Table Expression', () => {
    assert.isTrue(SQL.includes('cte'))
  })

  it('contains a @country_code query parameter', () => {
    assert.isTrue(SQL.includes('@country_code'))
  })

  it('contains a @yyyymm query parameter', () => {
    assert.isTrue(SQL.includes('@yyyymm'))
  })
})
