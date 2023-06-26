import { assert, describe, it } from 'vitest'
import {
  cookiesFromMatrix,
  getPreviousNMonths,
  runtestParamsFromMatrix
} from '../backend/utils'

const HEADERS_COOKIES = [
  'URL',
  'TC_PRIVACY',
  '_iub_cs-26569333',
  '_iub_cs-26569333-granular',
  'euconsent-v2',
  'fueldid'
]

const ROWS_COOKIES = [
  [
    'https://www.iltirreno.it/',
    '',
    '%7B%22timestamp%22%3A%222023-06-08T16%3A27%3A42.167Z%22%2C%22version%22%3A%221.48.0%22%2C%22purposes%22%3A%7B%221%22%3Atrue%2C%222%22%3Atrue%2C%224%22%3Atrue%2C%225%22%3Atrue%7D%2C%22id%22%3A26569333%7D',
    '%7B%7D',
    'CPtCwQAPtCwQAB7EtBITDECsAP_AAAAAAAAAJbtV_H__bX9r8f5_6ft0eY1f9_r77uQzDhfNk-4F3L_W_LwX_2E7NF36tq4KmR4Eu3LBIUNlHNHUTVmwaokVrzHsak2cpTNKJ6BEkHMRe2dYGF5umxtjeQKY5_p_d3f52T-9_dv-39z33913v3dZ_-_1-PDdU5_9Dfn9fRfb-9IL9_78v8v8_9_rk2_eX_3____7_H_-f_-4JaQCgAcABLAM-AjwBggDtgHcgSIAlGBLQAkJBhAAQAAuACgAKgAZAA5AB4AIAAYAAygBoAGoAPIAhgCKAEwAJ4AVQA3gBzAD0AH4AQkAhgCJAEcAJYATQApQBbgDDAGQAMsAbIA74B7AHxAPsA_YB_gIGARSAi4CMQEaARwAkwBKYCfgKCAU8Aq4BcwDFAGiANYAbQA3ABxAD5AIdAR6AkQBMoCdgFDgKPAUiApoBYoC2AFyALvAXmAwYBhsDIwMkAZOAy4BnIDPgGjANIgawBrIDbwG6gOCgcmBygDlwHjgPaAgwBCGCFwIXgQ5Ah6BD8CIYEUgI-gR_AkUBJCCTAJMgSbAlgBLMCW4aBEAFwAQwAyABlgDZgH2AfgBAACCgEYAJMAU8Aq8BaAFpANYAdUA-QCHQETAIqASIAnYBSIC5AGRgMnAZyAzwBnwDlAIMAR_AkUBLMCW4iA4AIYAZAAywBswD7APwAgABGACTAFPAKuAawA6oB8gEOgJEATsApEBcgDIwGTgM5AZ8A5QCDAEfwJFASzAluKgLgAUACGAEwALgAjgBlgEcAKvAWgBaQEegLYAXIAvMBkYDOQGeAM-AbkA5QCF4EfwJFAS3GQFgAhgBMAEcAMsAjgBVwCtgI9AScAtEBbAC5AF5gMjAZyAzwBnwDlAIXgR_AkUBLcdB5AAXABQAFQAMgAcgA-AEAALoAYABlADQANQAeAA-gCGAIoATAAngBVgC4ALoAYgAzABvADmAHoAP0AhgCJAEsAJoAUYApQBYgC3gGEAYcAyADKAGiANkAd4A9oB9gH6AP8AgYBFICLAIxARwBHQCTAEpgJ-AoIBTwCrgFigLQAtIBc4C8gL0AYoA2gBuADiAHOAOoAfYBDoCKgEXgI9ASIAlQBMgCdgFDgKPAU0AqwBYoCygFsALgAXIAu0Bd4C8wF9AMGAYaAx6BkYGSAMnAZUAywBlwDMwGcgM-AaIA0YBpADTQGqgNYAbeA3UBxcDkwOUAcuA8cB7QD6wIAgQYAg0BC-CHIIdAQ9AikBHYCPoEfwJFASQAkyBJsCVAEqwJYASzAluQgigALAAoABkAFwAMQAagBDACYAFMAKoAXAAxABmADeAHoARwApQBYgDCAGUAO8AfYA_wCKAEcAJSAUEAp4BV4C0ALSAXMAxQBtADnAHUAR6AkQBJwCVAFNAKsAWKAsoBaIC2AFwALkAXaAyMBk4DOQGeAM-AaIA1UBwADlAHjgQYAhQBC8CHQEPQI-gR_AkUBJACTIEtyUEUABAACwAKAAZAA4AB-AGAAYgA8ACIAEwAKoAXAAxABmgEMARIAjgBRgClAFuAMIAZQA2QB3wD7APwAjgBTwCrwFoAWkAuYBigDcAHUAPkAfYBDoCJgEVAIvAR6AkQBR4CxQFlALYAXaAvMBkYDJwGWAM5AZ4Az4BpADWAG3gOAAe0BAECB4EGAIQgQvAh6BH8CRQEkAJKgSZAluUgtAALgAoACoAGQAOQAfACCAGAAZQA0ADUAHkAQwBFACYAE8AKQAVQAxABmADmAH6AQwBEgCjAFKALEAW4AwoBkAGUANEAbIA74B9gH6ARYAjEBHAEdAJSAUEAq4BWwC5gF5AMUAbQA3AB9gEOgImAReAj0BIgCTgE7AKHAVYAsUBbAC4AFyALtAXmAvoBhsDIwMkAZOAywBlwDOQGeAM-AaRA1gDWQG3gN1AcFA5MDlAHLgPFAeOA9oCDAEIQIXgQzAh0BD0CKQEdgI_gSKAkgBJkCVQEswJbgA',
    ''
  ],
  ['https://www.lanazione.it/', '', '', '', '', ''],
  [
    'https://www.maisonsdumonde.com/',
    '0%40022%7C156%7C327%408%2C9%2C10%407%401686205890552%2C1686205890552%2C1701757890552%40',
    '',
    '',
    '',
    ''
  ]
]

const HEADERS_PARAMS = [
  'block',
  'cmdline',
  'fvonly',
  'lighthouse',
  'location',
  'login',
  'password',
  'profiler',
  'throttle_cpu',
  'timeline',
  'runs',
  'video'
]

const ROWS_PARAMS = [
  [
    '',
    '',
    '1',
    '0',
    'ec2-eu-south-1:Chrome.Cable',
    '',
    '',
    '0',
    '',
    '1',
    '1',
    '1'
  ],
  [
    '',
    '',
    '1',
    '0',
    'London_EC2:Chrome.3GFast',
    'some-username',
    'some-password',
    '0',
    '',
    '1',
    '1',
    '0'
  ]
]

describe('cookiesFromMatrix', () => {
  it('creates a matrix of parameters from Google Sheets headers+rows', () => {
    ROWS_COOKIES.forEach((row, i) => {
      assert.equal(
        row.length,
        HEADERS_COOKIES.length,
        `ROWS_COOKIES[${i}] does not match the headers' length`
      )
    })

    const arr = cookiesFromMatrix({
      headers: HEADERS_COOKIES,
      matrix: ROWS_COOKIES
    })

    assert.equal(arr.length, ROWS_COOKIES.length)

    arr.forEach((d, i) => {
      // -1 because each row in Google Sheets contains also the URL where the
      // cookie should be set
      assert.isAtMost(d.cookies.length, ROWS_COOKIES[i].length - 1)
    })
  })
})

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

describe('runtestParamsFromMatrix', () => {
  it('creates a matrix of parameters from Google Sheets headers+rows', () => {
    ROWS_PARAMS.forEach((row, i) => {
      assert.equal(
        row.length,
        HEADERS_PARAMS.length,
        `ROWS_PARAMS[${i}] does not match the headers' length`
      )
    })

    const matrix_params = runtestParamsFromMatrix({
      headers: HEADERS_PARAMS,
      matrix: ROWS_PARAMS
    })

    assert.equal(matrix_params.length, ROWS_PARAMS.length)

    matrix_params.forEach((params, i) => {
      assert.isAtMost(params.length, ROWS_PARAMS[i].length)
    })
  })
})
