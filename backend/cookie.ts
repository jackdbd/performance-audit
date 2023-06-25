/**
 * Decodes a cookie.
 *
 * @param {string} str The encoded cookie.
 * @return {string} The decoded cookie.
 * @customFunction
 */
export const DECODE_COOKIE = (str: string) => {
  const decoded = decodeURIComponent(str)
  return JSON.stringify(JSON.parse(decoded), null, 2)
}
