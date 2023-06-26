# assets

## WPT scripts

https://www.lanazione.it/

```txt
setEventName click_consent_banner_and_accept_cookies
execAndWait document.querySelector('#pt-accept-all').click()
```

https://www.maisonsdumonde.com/

```txt
setEventName click_consent_banner_and_accept_cookies
execAndWait document.querySelector('#footer_tc_privacy_button_2').click()
```

https://www.vino.com/

```txt
setEventName click_consent_banner_and_accept_cookies
execAndWait $x("//button[contains(text(),'Accetta')]")[0].click()
```

> :information_source: `$x` is for XPath expressions, and it's available in Chrome, Firefox, and probably other browsers.
