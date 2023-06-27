import type { RunTestsResult } from '../../shared/src/interfaces'
import { PREFIX } from '../../shared/src/constants'
import { DEFAULT_CONFIG, SELECTOR } from './constants'
import {
  url_signal,
  inject_script_signal,
  script_lines_signal,
  wpt_profiles_signal
} from './state'
import { onError, resetDataset } from './utils'

export const onBlur = (_ev: Event) => {
  const input = document.querySelector(
    SELECTOR.URL_TO_AUDIT
  ) as HTMLInputElement
  if (!input) {
    alert(`Selector ${SELECTOR.URL_TO_AUDIT} found no DOM element on this page`)
    return
  }

  const textarea_inject_script = document.querySelector(
    SELECTOR.INJECT_SCRIPT
  ) as HTMLTextAreaElement | null
  if (!textarea_inject_script) {
    alert(
      `Selector ${SELECTOR.INJECT_SCRIPT} found no DOM element on this page`
    )
    return
  }

  const textarea_script = document.querySelector(
    SELECTOR.WPT_SCRIPT
  ) as HTMLTextAreaElement | null
  if (!textarea_script) {
    alert(`Selector ${SELECTOR.WPT_SCRIPT} found no DOM element on this page`)
    return
  }

  const url = input.value
  if (!url) {
    return
  }

  const u = new URL(url)
  const value_href = localStorage.getItem(u.href)
  const value_origin = localStorage.getItem(u.origin)

  let config
  if (value_href) {
    console.log(
      `${PREFIX} found configuration matching HREF ${u.href} in localStorage`
    )
    config = JSON.parse(value_href)
  } else if (value_origin) {
    console.log(
      `${PREFIX} found configuration matching ORIGIN ${u.origin} in localStorage`
    )
    config = JSON.parse(value_origin)
  } else {
    console.log(`${PREFIX} found no configuration for ${url} in localStorage`)
    config = DEFAULT_CONFIG
  }

  console.log(`${PREFIX} configuration`)
  console.table(config)
  console.groupEnd()

  // highlight the textareas with some CSS, so the user understands these values
  // have changed.
  if (config.inject_script) {
    textarea_inject_script.value = config.inject_script
    // https://medium.com/@DavidKPiano/css-animations-with-finite-state-machines-7d596bb2914a
    textarea_inject_script.dataset.state = 'just-updated'
  }

  if (config.script_lines) {
    textarea_script.value = config.script_lines.join('\n')
    textarea_script.dataset.state = 'just-updated'
  }

  setTimeout(
    () => resetDataset('state', [textarea_inject_script, textarea_script]),
    2000
  )
}

export const onSubmit = (ev: Event) => {
  ev.preventDefault()

  const el_url = document.querySelector(
    SELECTOR.URL_TO_AUDIT
  ) as HTMLInputElement | null
  if (!el_url) {
    return
  }

  const el_inject_script = document.querySelector(
    SELECTOR.INJECT_SCRIPT
  ) as HTMLTextAreaElement | null
  if (!el_inject_script) {
    return
  }

  const el_wpt_script = document.querySelector(
    SELECTOR.WPT_SCRIPT
  ) as HTMLTextAreaElement | null
  if (!el_wpt_script) {
    return
  }

  inject_script_signal.value = el_inject_script.value
  script_lines_signal.value = el_wpt_script.value.split('\n')
  url_signal.value = el_url.value

  const inject_script = inject_script_signal.value
  const script_lines = script_lines_signal.value
  const url = url_signal.value

  const u = new URL(url)
  const str = JSON.stringify({ inject_script, script_lines })
  localStorage.setItem(u.href, str)
  localStorage.setItem(u.origin, str)

  // // https://developer.mozilla.org/en-US/docs/Web/CSS/:checked
  const ids = [...document.querySelectorAll('input:checked')]
    .filter((el) => el.id.startsWith('wpt-profile'))
    .map((el) => el.id)

  const wpt_profiles = wpt_profiles_signal.value.map((p) => {
    const checked = ids.some((id) => id === p.id)
    return { ...p, checked }
  })

  const profiles = wpt_profiles.filter((p) => p.checked).map((p) => p.params)

  if (import.meta.env.DEV) {
    const checkboxes = wpt_profiles.map((p) => {
      const { params, ...rest } = p
      return rest
    })
    const obj = { checkboxes, inject_script, script_lines, url }
    const s = JSON.stringify(obj, null, 2)
    alert(`obj at the time of this form submission\n${s}`)
  } else {
    google.script.run
      .withFailureHandler(onError)
      .withSuccessHandler((result: RunTestsResult) => {
        const { error_messages, successes } = result

        if (error_messages.length > 0) {
          onError(new Error(error_messages.join('\n')))
          return
        }

        const summary =
          successes.length === 1
            ? 'Launched 1 WPT test'
            : `Launched ${successes.length} WPT tests`

        const test_ids = successes.map((d) => d.testId)

        google.script.run
          .withFailureHandler(onError)
          .showWebPageTestDialog({ summary, test_ids })
      })
      .runtests({
        url,
        array_of_cookies: [],
        inject_script,
        profiles,
        script_lines
      })
  }
}
