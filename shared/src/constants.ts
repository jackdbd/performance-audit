export const PREFIX = '[performance audit] '

export const GCP_PROJECT_ID = 'prj-kitchen-sink'

export const SHEET_NAME = {
  COOKIES: 'cookies',
  HOW_TO_USE: 'How to use',
  WPT_RUNTEST_PARAMS: 'WPT /runtest params'
}

export const CRUX_QUERY_DEVICE_AND_CONNECTIVITY_BY_COUNTRY = `
WITH cte AS (
  SELECT
    yyyymm,
    \`chrome-ux-report.experimental\`.GET_COUNTRY(country_code) AS country,
    rank,
    desktopDensity,
    phoneDensity,
    tabletDensity,
    _4GDensity,
    _3GDensity,
    _2GDensity,
    slow2GDensity,
    offlineDensity
  FROM
    \`chrome-ux-report.materialized.country_summary\`
  WHERE
    origin = @url
    AND yyyymm IN UNNEST(@months)
)
SELECT
  country,
  COUNT(DISTINCT yyyymm) AS months_in_crux,
  ROUND(AVG(rank)) AS coarse_popularity,
  SAFE_MULTIPLY(ROUND(SUM(desktopDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS desktop_traffic,
  SAFE_MULTIPLY(ROUND(SUM(phoneDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS phone_traffic,
  SAFE_MULTIPLY(ROUND(SUM(tabletDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS tablet_traffic,
  SAFE_MULTIPLY(ROUND(SUM(_4GDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_4G,
  SAFE_MULTIPLY(ROUND(SUM(_3GDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_3G,
  SAFE_MULTIPLY(ROUND(SUM(_2GDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_2G,
  SAFE_MULTIPLY(ROUND(SUM(slow2GDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_slow2G,
  SAFE_MULTIPLY(ROUND(SUM(offlineDensity), COUNT(DISTINCT yyyymm)), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_offline
FROM
  cte
GROUP BY
  country
ORDER BY
  months_in_crux DESC,
  coarse_popularity ASC;`

export const CRUX_QUERY_POOR_TTFB = `
WITH cte AS (
  SELECT
    origin,
    country_code,
    rank AS coarse_popularity,
    device,

    ROUND(SAFE_MULTIPLY(desktopDensity, 100), 2) AS percent_desktop,
    ROUND(SAFE_MULTIPLY(tabletDensity, 100), 2) AS percent_tablet,
    ROUND(SAFE_MULTIPLY(phoneDensity, 100), 2) AS percent_phone,

    ROUND(SAFE_MULTIPLY(slow_ttfb, 100), 2) AS ttfb_poor,
    ROUND(SAFE_MULTIPLY(avg_ttfb, 100), 2) AS ttfb_needs_improvement,
    ROUND(SAFE_MULTIPLY(fast_ttfb, 100), 2) AS ttfb_good,
    p75_ttfb AS ttfb_ms_p75
  FROM
    \`chrome-ux-report.materialized.country_summary\`
  WHERE
    UPPER(country_code) = @country_code
    AND device = @form_factor
    AND yyyymm = @yyyymm
    AND rank <= 1000
    AND slow_ttfb > 0.20
)
SELECT
  origin,
  ttfb_poor,
  ttfb_needs_improvement,
  ttfb_good,
  ttfb_ms_p75
FROM
  cte
ORDER BY
  ttfb_poor DESC;`

export const DEFAULT = {
  COUNTRY_CODE: 'IT',
  FORM_FACTOR: 'PHONE',
  MAXIMUM_BYTES_BILLED: 15_000_000_000,
  QUERY_TIMEOUT_MS: 5000,
  URL: 'https://www.google.com',
  YYYYMM: 202306
}
