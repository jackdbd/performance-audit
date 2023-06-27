import { assert, describe, it } from 'vitest'
import { getPreviousNMonths } from '../src/utils'

describe('getPreviousNMonths', () => {
  it('is in the yyyymm format', () => {
    const arr = getPreviousNMonths(3)

    const this_year = new Date().getFullYear()

    assert.equal(arr.length, 3)

    arr.forEach((yyyymm) => {
      assert.isAtLeast(parseInt(yyyymm.slice(0, 4)), this_year)
      assert.equal(yyyymm.length, 6)
      assert.isTrue(yyyymm[4] === '0' || yyyymm[4] === '1')
    })
  })
})
