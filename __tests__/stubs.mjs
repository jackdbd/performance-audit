import { vi } from 'vitest'

const getDocumentProperty = vi.fn((prop) => {
  return `the value of the document property ${prop} is xyz`
})

const getScriptProperty = vi.fn((prop) => {
  return `the value of the script property ${prop} is xyz`
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

export const UrlFetchApp = {
  fetch: (url, options) => {
    return {
      getContentText: () => {
        return JSON.stringify({ data: WEBPAGETEST_LOCATIONS }, null, 2)
      }
    }
  }
}
