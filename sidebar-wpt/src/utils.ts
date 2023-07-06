import { PREFIX } from '../../shared/src/constants'

export const onError = (error: any) => {
  const message = error.message || 'got an error with no message'
  console.error(`${PREFIX} error`, error)
  alert(`ERROR: ${message}`)
}

const ROW_ONE = [
  '',
  '',
  '1',
  '0',
  'ec2-eu-south-1:Chrome.Cable',
  '',
  '',
  '1',
  '1',
  '1'
]

const ROW_TWO = [
  '',
  '',
  '1',
  '0',
  'London_EC2:Chrome.3GFast',
  'some-username',
  'some-password',
  '1',
  '1',
  '1'
]

const ROW_THREE = [
  '',
  '',
  '1',
  '0',
  'Dulles:Chrome.Cable',
  '',
  '',
  '1',
  '1',
  '1'
]

export const FAKE_WPT_PARAMS_HEADERS = [
  'bwDown',
  'bwUp',
  'fvonly',
  'lighthouse',
  'location',
  'login',
  'password',
  'runs',
  'timeline',
  'video'
]

export const fakeWptParamsRows = () => {
  if (Math.random() > 0.5) {
    return [ROW_ONE, ROW_TWO, ROW_THREE]
  } else {
    return [ROW_ONE, ROW_TWO]
  }
}

export function resetDataset(key: string, elements: HTMLElement[]) {
  for (const el of elements) {
    el.dataset[key] = ''
  }
}
