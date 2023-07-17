import { assert, describe, it } from 'vitest'
import { CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY } from '../../shared/src/constants'

describe('CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY', () => {
  it('contains a Common Table Expression', () => {
    assert.isTrue(CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY.includes('cte'))
  })

  it('contains a @url query parameter', () => {
    assert.isTrue(
      CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY.includes('@url')
    )
  })

  it('contains a @months query parameter', () => {
    assert.isTrue(
      CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY.includes('@months')
    )
  })
})
