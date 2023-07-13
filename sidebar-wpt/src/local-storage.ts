import { PREFIX } from '../../shared/src/constants'
import { DEFAULT_CONFIG } from './constants'
import { inject_script_signal, script_lines_signal, url_signal } from './state'

// TODO: probably not necessary, since I think I only need to get values from
// localStorage in the onblur event handler
export const subscribeStateToLocalStorage = () => {
  const ms = 15000

  const cb = () => {
    console.log(`${PREFIX}poll localStorage (every ${ms}ms)`)

    const url = url_signal.value

    if (url) {
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
        console.log(
          `${PREFIX} found no configuration for ${url} in localStorage`
        )
        config = DEFAULT_CONFIG
      }

      inject_script_signal.value = config.inject_script as string
      script_lines_signal.value = config.script_lines as string[]
    } else {
      inject_script_signal.value = DEFAULT_CONFIG.inject_script as string
      script_lines_signal.value = DEFAULT_CONFIG.script_lines as string[]
    }
  }

  return setInterval(cb, ms)
}

export const populateLocalStorageWithFakes = () => {
  localStorage.clear()

  const arr = [
    {
      url: 'https://www.iltirreno.it/firenze/cronaca',
      selector: '.iubenda-cs-accept-btn'
    },
    { url: 'https://www.lanazione.it/economia', selector: '#pt-accept-all' },
    {
      url: 'https://www.maisonsdumonde.com/FR/fr/e/conseil-relooking-deco',
      selector: '#footer_tc_privacy_button_2'
    },
    {
      url: 'https://www.vino.com/selezione/franciacorta',
      selector: '#info-cookies button'
    }
  ]

  arr.forEach(({ url, selector }, i) => {
    const u = new URL(url)

    const inject_script = `console.log('Hello URL[${i}] ${url}')`

    const script_lines = [
      `navigate ${url}`,
      `execAndWait document.querySelector('${selector}').click()`
    ]
    const str = JSON.stringify({ inject_script, script_lines })

    localStorage.setItem(u.href, str)
    localStorage.setItem(u.origin, str)
  })
}
