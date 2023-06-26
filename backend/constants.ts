export const SHEET_NAME = {
  COOKIES: 'cookies',
  HOW_TO_USE: 'How to use',
  WPT_RUNTEST_PARAMS: 'WPT /runtest params'
}

export const MENU = {
  TITLE: 'Performance Audit',
  ITEM_ONE_CAPTION: 'Define WebPageTest tests',
  ITEM_TWO_CAPTION: 'Define query on BigQuery CrUX dataset'
}

export const CRUX_QUERY = `
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
  ROUND(AVG(rank)) AS coarse_popularity,
  COUNT(DISTINCT yyyymm) AS months_in_crux,
  SAFE_MULTIPLY(ROUND(SUM(desktopDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_desktop,
  SAFE_MULTIPLY(ROUND(SUM(phoneDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_phone,
  SAFE_MULTIPLY(ROUND(SUM(tabletDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_tablet,
  SAFE_MULTIPLY(ROUND(SUM(_4GDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_4G,
  SAFE_MULTIPLY(ROUND(SUM(_3GDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_3G,
  SAFE_MULTIPLY(ROUND(SUM(_2GDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_2G,
  SAFE_MULTIPLY(ROUND(SUM(slow2GDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_slow2G,
  SAFE_MULTIPLY(ROUND(SUM(offlineDensity), 2), DIV(100, COUNT(DISTINCT yyyymm))) AS percent_offline
FROM
  cte
GROUP BY
  country
ORDER BY
  months_in_crux DESC,
  coarse_popularity ASC;`
