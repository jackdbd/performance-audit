import { SHEET_NAME } from '../../shared/src/constants'
import './style.css'
import './sidebar-wpt.css'
import { onBlur, onSubmit } from './event-handlers'
import { inject_script_signal, url_signal, wpt_script_signal, wpt_profiles_signal } from './state'

// see here for how to style a sidebar
// https://developers.google.com/apps-script/add-ons/guides/css#sidebars

export const FieldsetUrlToAudit = () => {
  const url = url_signal.value
  return (
    <fieldset>
      <legend>URL</legend>
      <p class="gray">Paste the URL to audit.</p>
      {url ? 
      <input id="url-to-audit" name="url" required title="The URL to audit" type="url" data-testid="url-to-audit" onBlur={onBlur} value={url} /> : 
      <input id="url-to-audit" name="url" required title="The URL to audit" type="url" data-testid="url-to-audit" onBlur={onBlur} />}
    </fieldset>
  )
}

export const FieldsetWptProfiles = () => {
  const wpt_profiles_legend = SHEET_NAME.WPT_RUNTEST_PARAMS
  const wpt_profiles = wpt_profiles_signal.value

  const lis = wpt_profiles.map((p, _i) => {
    //  console.log(`WPT profile[${_i}]`, p)

    return (
      <li>
        <label for={p.id}>{p.name}</label>
        {p.checked ? 
        <input type="checkbox" id={p.id} name={p.name} data-row-index={p['row-index']} checked></input> : 
        <input type="checkbox" id={p.id} name={p.name} data-row-index={p['row-index']}></input>}
      </li>
    )
    
  })

  return (
  <fieldset>
    <legend>{wpt_profiles_legend}</legend>
    <p class="gray">Select all the profiles you want to test. Cookies will be set automatically from the <code>cookies</code> spreadsheet tab.</p>
    <ul class="cluster" data-align="start">
      {lis}
    </ul>
  </fieldset>
  )
}

export const FieldsetWptScript = () => {
  const wpt_script = wpt_script_signal.value
  
  return (
    <fieldset>
      <legend>WPT script</legend>
      <p class="gray">WebPageTest <code>script</code> parameter. See <a href="https://docs.webpagetest.org/scripting/">Scripting</a>.</p>
      <textarea id="wpt-script" name="wpt-script" rows={4} cols={50}>{wpt_script}</textarea>
  </fieldset>
  )
}

export const FieldsetJsScript = () => {
  const inject_script = inject_script_signal.value

  return (
    <fieldset>
      <legend>JS script</legend>
      <p class="gray">JavaScript to run on the page as soon as the document exists.</p>
      {inject_script ? 
      <textarea id="inject-script" name="inject-script" rows={4} cols={50}>{inject_script}</textarea> : 
      <textarea id="inject-script" name="inject-script" rows={4} cols={50}></textarea>}
    </fieldset>
  )
}


export function App() {
  return (
    <form class="box flow" name="Audit" method="POST" action="" onSubmit={onSubmit}>
      <FieldsetUrlToAudit />
      <FieldsetWptProfiles />
      <FieldsetWptScript />
      <FieldsetJsScript />

      <button class="action" name="submit" type="submit" data-testid="submit-button">Submit tests to WPT</button>
    </form>
  )
}

// Required Validation for a group of checkboxes
// https://html.form.guide/checkbox/html-form-checkbox-required/
// https://vyspiansky.github.io/2019/07/13/javascript-at-least-one-checkbox-must-be-selected/
// form_elem.addEventListener("formdata", (ev) => {
//   const formData = ev.formData
//   // formdata gets modified by the formdata event
//   formData.set("email", formData.get("email").toLowerCase())
// })
