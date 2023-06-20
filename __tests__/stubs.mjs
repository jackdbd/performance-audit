import { vi } from 'vitest'

export const COOKIES_ACCEPT_CONSENT_BANNER = [
  {
    key: '_iub_cs-26569333',
    value:
      '%7B%22timestamp%22%3A%222023-06-08T16%3A27%3A42.167Z%22%2C%22version%22%3A%221.48.0%22%2C%22purposes%22%3A%7B%221%22%3Atrue%2C%222%22%3Atrue%2C%224%22%3Atrue%2C%225%22%3Atrue%7D%2C%22id%22%3A26569333%7D'
  },
  {
    key: 'TC_PRIVACY',
    value:
      '0%40022%7C156%7C327%408%2C9%2C10%407%401686205890552%2C1686205890552%2C1701757890552%40'
  }
]

export const COOKIES_REJECT_CONSENT_BANNER = [
  {
    key: '_iub_cs-26569333',
    value:
      '%7B%22timestamp%22%3A%222023-06-08T16%3A27%3A42.167Z%22%2C%22version%22%3A%221.48.0%22%2C%22purposes%22%3A%7B%221%22%3Atrue%2C%222%22%3Atrue%2C%224%22%3Atrue%2C%225%22%3Atrue%7D%2C%22id%22%3A26569333%7D'
  },
  {
    key: 'TC_PRIVACY',
    value:
      '0%40022%7C156%7C327%408%2C9%2C10%407%401686205890552%2C1686205890552%2C1701757890552%40'
  }
]

export const ARRAY_OF_COOKIES = [
  COOKIES_ACCEPT_CONSENT_BANNER,
  COOKIES_REJECT_CONSENT_BANNER
]

export const PROFILE_DULLES_CHROME_CABLE = [
  {
    key: 'location',
    value: 'Dulles:Chrome.Cable'
  },
  {
    key: 'fvonly',
    value: 1
  },
  {
    key: 'runs',
    value: 1
  }
]

export const PROFILE_LONDON_CHROME_3GFAST = [
  {
    key: 'location',
    value: 'London_EC2:Chrome.3GFast'
  },
  {
    key: 'fvonly',
    value: 1
  },
  {
    key: 'runs',
    value: 1
  }
]

export const PROFILE_MILAN_CHROME_CANARY_4G = [
  {
    key: 'location',
    value: 'ec2-eu-west-3:Chrome%20Canary.4G'
  },
  {
    key: 'fvonly',
    value: 1
  },
  {
    key: 'runs',
    value: 1
  }
]

export const PROFILES = [
  PROFILE_DULLES_CHROME_CABLE,
  PROFILE_LONDON_CHROME_3GFAST,
  PROFILE_MILAN_CHROME_CANARY_4G
]

const getDocumentProperty = vi.fn((prop) => {
  return `the value of the document property ${prop} is xyz`
})

const getScriptProperty = vi.fn((prop) => {
  return process.env[prop]
})

const getUserProperty = vi.fn((prop) => {
  return `the value of the user property ${prop} is xyz`
})

const getDocumentProperties = vi.fn(() => {
  return {
    getProperty: getDocumentProperty
  }
})

const getScriptProperties = vi.fn(() => {
  return {
    getProperty: getScriptProperty
  }
})

const getUserProperties = vi.fn(() => {
  return {
    getProperty: getUserProperty
  }
})

export const PropertiesService = {
  getDocumentProperties,
  getScriptProperties,
  getUserProperties
}

// in alternative...
// globalThis.PropertiesService = {
//   getDocumentProperties,
//   getScriptProperties,
//   getUserProperties
// }

export const London_EC2 = {
  Browsers:
    'Chrome,Chrome Beta,Chrome Canary,Firefox,Firefox Nightly,Firefox ESR,Brave,Edge',
  Label: 'London, UK - EC2',
  PendingTests: {
    Blocking: 11,
    HighPriority: 0,
    Idle: 5,
    LowPriority: 91,
    Queued: 91,
    TestAgentRatio: 6.375,
    Testing: 11,
    Total: 102,
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
    p5: 91,
    p6: 0,
    p7: 0,
    p8: 0,
    p9: 0
  },
  group: 'Europe',
  labelShort: 'London, UK - EC2',
  location: 'London_EC2',
  node: '4797',
  status: 'OK'
}

export const EC2_EU_SOUTH_1 = {
  Label: 'Milan, Italy - EC2',
  location: 'ec2-eu-south-1',
  Browsers:
    'Chrome,Chrome Beta,Chrome Canary,Firefox,Firefox Nightly,Firefox ESR,Brave,Edge',
  status: 'OK',
  labelShort: 'Milan, Italy - EC2',
  node: '4801',
  group: 'Europe',
  PendingTests: {
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
    p5: 84,
    p6: 0,
    p7: 0,
    p8: 0,
    p9: 0,
    Blocking: 4,
    Total: 88,
    Queued: 84,
    HighPriority: 0,
    LowPriority: 84,
    Testing: 4,
    Idle: 1,
    TestAgentRatio: 17.6
  }
}

export const EC2_AP_NORTHEAST_3 = {
  Label: 'Osaka, Japan - EC2',
  location: 'ec2-ap-northeast-3',
  Browsers:
    'Chrome,Chrome Beta,Chrome Canary,Firefox,Firefox Nightly,Firefox ESR,Brave,Edge',
  status: 'OK',
  labelShort: 'Osaka, Japan - EC2',
  node: '4826',
  group: 'Asia',
  PendingTests: {
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
    p5: 46,
    p6: 0,
    p7: 0,
    p8: 0,
    p9: 0,
    Blocking: 4,
    Total: 50,
    Queued: 46,
    HighPriority: 0,
    LowPriority: 46,
    Testing: 4,
    Idle: 3,
    TestAgentRatio: 7.142857142857143
  }
}

export const WEBPAGETEST_LOCATIONS = {
  'ec2-ap-northeast-3': EC2_AP_NORTHEAST_3,
  'ec2-eu-south-1': EC2_EU_SOUTH_1,
  London_EC2
}

export const getLocationsResponse = {
  statusCode: 200,
  statusText: 'Ok',
  data: {
    'ec2-us-east-1': {
      Label: 'Virginia - EC2',
      location: 'ec2-us-east-1',
      Browsers:
        'Chrome,Chrome Beta,Chrome Canary,Firefox,Firefox Nightly,Firefox ESR,Brave,Edge',
      status: 'OK',
      labelShort: 'Virginia USA - EC2 ',
      node: '4789',
      default: true,
      group: 'North America',
      PendingTests: {
        p1: 0,
        p2: 291,
        p3: 0,
        p4: 0,
        p5: 330,
        p6: 0,
        p7: 0,
        p8: 0,
        p9: 0,
        Blocking: 452,
        Total: 782,
        Queued: 706,
        HighPriority: 85,
        LowPriority: 621,
        Testing: 76,
        Idle: 30,
        TestAgentRatio: 7.377358490566038
      }
    },
    'ec2-ap-northeast-2': {
      Label: 'Seoul, Korea - EC2',
      location: 'ec2-ap-northeast-2',
      Browsers:
        'Chrome,Chrome Beta,Chrome Canary,Firefox,Firefox Nightly,Firefox ESR,Brave,Edge',
      status: 'OK',
      labelShort: 'Seoul, Korea - EC2',
      node: '4816',
      group: 'Asia',
      PendingTests: {
        p1: 0,
        p2: 0,
        p3: 0,
        p4: 0,
        p5: 26,
        p6: 0,
        p7: 0,
        p8: 0,
        p9: 0,
        Blocking: 1,
        Total: 27,
        Queued: 26,
        HighPriority: 0,
        LowPriority: 26,
        Testing: 1,
        Idle: 0,
        TestAgentRatio: 27
      }
    }
  }
}

export const getTestersResponse = {
  statusCode: 200,
  statusText: 'Ok',
  data: {
    'ec2-us-east-1': {
      testers: [
        {
          id: 'wpt_use1_instance-10.10.1.201-3.219.212.117',
          pc: 'wpt_use1_instance-10.10.1.201',
          ec2: '',
          ip: '3.219.212.117',
          version: '230405.214311',
          freedisk: '20.229',
          upminutes: '357',
          ie: null,
          winver: '',
          isWinServer: '',
          isWin64: '',
          dns: '127.0.0.53',
          GPU: null,
          offline: null,
          screenwidth: '',
          screenheight: '',
          rebooted: false,
          cpu: 50,
          errors: 9,
          elapsed: 0,
          last: 0,
          busy: 1
        },
        {
          id: 'wpt_use1_instance-10.10.1.202-172.70.34.104',
          pc: 'wpt_use1_instance-10.10.1.202',
          ec2: '',
          ip: '172.70.34.104',
          version: '230405.214311',
          freedisk: '20.258',
          upminutes: '794',
          ie: null,
          winver: '',
          isWinServer: '',
          isWin64: '',
          dns: '127.0.0.53',
          GPU: null,
          offline: null,
          screenwidth: '',
          screenheight: '',
          rebooted: false,
          elapsed: 3,
          busy: 0
        }
      ]
    },
    'ec2-us-west-2-sea': {
      testers: [
        {
          id: 'wpt_usw2sea_instance-10.10.3.114-172.71.146.29',
          pc: 'wpt_usw2sea_instance-10.10.3.114',
          ec2: '',
          ip: '172.71.146.29',
          version: '230405.214311',
          freedisk: '22.226',
          upminutes: '242',
          ie: null,
          winver: '',
          isWinServer: '',
          isWin64: '',
          dns: '127.0.0.53',
          GPU: null,
          offline: null,
          screenwidth: '',
          screenheight: '',
          rebooted: false,
          elapsed: 47,
          busy: 0
        },
        {
          id: 'wpt_usw2sea_instance-10.10.3.54-108.162.245.28',
          pc: 'wpt_usw2sea_instance-10.10.3.54',
          ec2: '',
          ip: '108.162.245.28',
          version: '230405.214311',
          freedisk: '22.093',
          upminutes: '242',
          ie: null,
          winver: '',
          isWinServer: '',
          isWin64: '',
          dns: '127.0.0.53',
          GPU: null,
          offline: null,
          screenwidth: '',
          screenheight: '',
          rebooted: false,
          elapsed: 47,
          busy: 0
        }
      ],
      elapsed: 47,
      status: 'OK',
      label: 'Seattle',
      node: '6095'
    }
  }
}

export const runtestResponseGET = {
  data: {
    testId: '230620_BiDcED_9DX'
  }
}

export const runtestResponsePOST = {
  data: {
    testId: '230620_BiDcED_9DX'
  }
}

export const testBalanceResponse = {
  data: {
    remaining: 987
  }
}

export const UrlFetchApp = {
  fetch: (url, options) => {
    if (url.includes('getLocations.php')) {
      return {
        getContentText: () => {
          return JSON.stringify(getLocationsResponse, null, 2)
        }
      }
    }

    if (url.includes('getTesters.php')) {
      return {
        getContentText: () => {
          return JSON.stringify(getTestersResponse, null, 2)
        }
      }
    }

    if (url.includes('runtest.php')) {
      if (options.method === 'post') {
        return {
          getContentText: () => {
            return JSON.stringify(runtestResponsePOST, null, 2)
          },
          getHeaders: () => {
            // TODO: see which HTTP headers are returned by the WebPageTest /runtest API endpoint
            return JSON.stringify({ server: 'cloudflare' }, null, 2)
          }
        }
      } else {
        return {
          getContentText: () => {
            return JSON.stringify(runtestResponseGET, null, 2)
          }
        }
      }
    }

    if (url.includes('testBalance.php')) {
      return {
        getContentText: () => {
          return JSON.stringify(testBalanceResponse, null, 2)
        }
      }
    }

    throw new Error(
      `Not implemented: UrlFetchApp.fetch does not currently handle URLs like ${url}`
    )
  }
}
