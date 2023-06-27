import { computed, signal } from '@preact/signals'
import type { WebPageTestProfile } from './webpagetest'

export interface State {
  inject_script?: string
  script_lines: string[]
  url?: string
  wpt_profiles: WebPageTestProfile[]
}

export const url_signal = signal<string | undefined>(undefined)

export const wpt_profiles_signal = signal<WebPageTestProfile[]>([])

export const inject_script_signal = signal<string | undefined>(undefined)

export const script_lines_signal = signal<string[]>([])

// export const wpt_script_signal = computed(() => {
//   return script_lines_signal.value.join('&#13;&#10;')
// })

export const wpt_script_signal = computed(() => {
  return script_lines_signal.value.join('\n')
})
