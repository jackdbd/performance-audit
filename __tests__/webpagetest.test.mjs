import { afterAll, assert, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  GET_WEBPAGETEST_API_KEY,
  GET_WEBPAGETEST_TEST_BALANCE,
  GET_WEBPAGETEST_TESTERS,
  queryString,
  runtest,
  runtests
} from '../src/webpagetest'
import {
  EC2_AP_NORTHEAST_3,
  EC2_EU_SOUTH_1,
  London_EC2,
  COOKIES_ACCEPT_CONSENT_BANNER,
  ARRAY_OF_COOKIES,
  PROFILES,
  PROFILE_DULLES_CHROME_CABLE,
  PROFILE_LONDON_CHROME_3GFAST,
  PropertiesService,
  SpreadsheetApp,
  UrlFetchApp
} from './stubs.mjs'

describe('queryString', () => {
  it('is sorted alphabetically', () => {
    const url = 'https://example.com/'
    const k = 'my-WPT-API-key'

    const cookie_key = 'TC_PRIVACY'
    const cookie_value =
      '0%40022%7C156%7C327%408%2C9%2C10%407%401686205890552%2C1686205890552%2C1701757890552%40'
    const cookie = `${cookie_key}=${cookie_value}`

    // const decoded = decodeURIComponent(cookie_value)

    const script = [`setCookie %ORIGIN% ${cookie}`, 'navigate %URL%'].join('\n')
    const whitespace = '%20'
    const newline = '0A'
    const equal_sign = '3D'
    const percent = '%25'
    const expected_script = `setCookie${whitespace}${percent}ORIGIN${percent}${whitespace}${cookie_key}%${equal_sign}0%2540022%257C156%257C327%25408%252C9%252C10%25407%25401686205890552%252C1686205890552%252C1701757890552%2540%${newline}navigate${whitespace}${percent}URL${percent}`

    const params = [
      {
        key: 'url',
        value: url
      },
      {
        key: 'k',
        value: k
      },
      {
        key: 'label',
        value: 'some-label'
      },
      {
        key: 'location',
        value: 'Dulles:Chrome.Cable'
      },
      {
        key: 'f',
        value: 'json'
      },
      {
        key: 'fvonly',
        value: 1
      },
      {
        key: 'runs',
        value: 1
      },
      {
        key: 'script',
        value: script
      }
    ]

    const expected = `f=json&fvonly=1&k=my-WPT-API-key&label=some-label&location=Dulles%3AChrome.Cable&runs=1&script=${expected_script}&url=https%3A%2F%2Fexample.com%2F`

    assert.equal(queryString(params), expected)
  })
})

describe('GET_WEBPAGETEST_API_KEY', () => {
  beforeAll(() => {
    vi.stubGlobal('PropertiesService', PropertiesService)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns the expected value for the property', () => {
    const expected = process.env['WEBPAGETEST_API_KEY']

    assert.equal(GET_WEBPAGETEST_API_KEY(), expected)
  })
})

describe('GET_WEBPAGETEST_LOCATIONS', () => {
  let expected_locations
  beforeAll(async () => {
    vi.stubGlobal('UrlFetchApp', UrlFetchApp)

    const res = await fetch(
      'https://www.webpagetest.org/getLocations.php?f=json'
    )
    const { data } = await res.json()
    expected_locations = data
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns the expected locations', () => {
    // const locations = GET_WEBPAGETEST_LOCATIONS()

    // const subset = {
    //   'ec2-ap-northeast-3': EC2_AP_NORTHEAST_3,
    //   'ec2-eu-south-1': EC2_EU_SOUTH_1,
    //   London_EC2
    // }

    assert.containsAllKeys(expected_locations, [
      'ec2-ap-northeast-3',
      'ec2-eu-south-1',
      'London_EC2'
    ])

    // assert.containSubset(locations, subset)
  })
})

describe('GET_WEBPAGETEST_TESTERS', () => {
  let expected_testers
  beforeAll(async () => {
    vi.stubGlobal('UrlFetchApp', UrlFetchApp)

    const res = await fetch('https://www.webpagetest.org/getTesters.php?f=json')
    const { data } = await res.json()
    expected_testers = data
  })

  it.skip('returns the expected testers', () => {
    const testers = GET_WEBPAGETEST_TESTERS()
    assert.containSubset(expected_testers, testers)
  })
})

describe('GET_WEBPAGETEST_TEST_BALANCE', () => {
  let expected_test_balance
  beforeAll(async () => {
    vi.stubGlobal('PropertiesService', PropertiesService)
    vi.stubGlobal('UrlFetchApp', UrlFetchApp)
    const k = process.env['WEBPAGETEST_API_KEY']

    const res = await fetch(
      `https://www.webpagetest.org/testBalance.php?f=json&k=${k}`
    )
    const { data } = await res.json()
    expected_test_balance = data
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns the expected test balance', () => {
    const test_balance = GET_WEBPAGETEST_TEST_BALANCE()
    const expected = 987

    assert.deepEqual(JSON.parse(test_balance), expected)
  })
})

describe('runtest', () => {
  const url = 'https://example.com/'

  beforeAll(async () => {
    vi.stubGlobal('PropertiesService', PropertiesService)
    vi.stubGlobal('UrlFetchApp', UrlFetchApp)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns the expected testId', async () => {
    const k = process.env['WEBPAGETEST_API_KEY']
    const cookies = COOKIES_ACCEPT_CONSENT_BANNER
    const profile = PROFILE_DULLES_CHROME_CABLE

    const params = [
      ...profile,
      { key: 'f', value: 'json' },
      { key: 'k', value: k },
      {
        key: 'pingback',
        value: 'https://webhooks.giacomodebidda.com/webpagetest'
      },
      { key: 'url', value: url }
    ]

    const qs = queryString(params)

    // TODO: this POST does not work
    const options = {
      method: 'post',
      body: qs
      // body: JSON.stringify(qs)
    }

    // const res = await fetch(`https://www.webpagetest.org/runtest.php`, options)
    // const res = await fetch(`https://www.webpagetest.org/runtest.php?${qs}`)
    // console.log('=== res.headers ===', res.headers)
    // console.log('=== res.body ===', res.body)
    // const response = await res.text()

    const expected_test_id = '230620_BiDcED_9DX'

    const { testId } = runtest({ cookies, profile, url })

    assert.equal(testId, expected_test_id)
  })
})

describe('runtests', () => {
  const url = 'https://example.com/'

  beforeAll(async () => {
    vi.stubGlobal('PropertiesService', PropertiesService)
    vi.stubGlobal('SpreadsheetApp', SpreadsheetApp)
    vi.stubGlobal('UrlFetchApp', UrlFetchApp)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns the expected number of results', async () => {
    const array_of_cookies = ARRAY_OF_COOKIES
    const profiles = PROFILES

    const result = runtests({ array_of_cookies, profiles, url })

    assert.equal(result.length, array_of_cookies.length * profiles.length)
  })
})
