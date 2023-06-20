export interface Param {
  key: string
  value: string | number | boolean
}

/**
 * Creates a matrix of cookies for the WebPageTest /runtest endpoint.
 *
 * @param {Object} config headers and values extracted from Google Sheets.
 * @return {Array} matrix of cookies
 */
export const cookiesFromMatrix = ({
  headers,
  matrix
}: {
  headers: string[]
  matrix: any[][]
}) => {
  const arr = matrix.reduce((acc, row) => {
    const [url, ...cookie_values] = row

    const cookies = cookie_values
      .map((val, i) => {
        const value = val !== '' ? val : undefined
        return { key: headers[i + 1], value }
      })
      .filter((c) => c.value)

    return acc.concat({ url, cookies })
  }, [])

  return arr
}

/**
 * Creates a matrix of parameters for the WebPageTest /runtest endpoint.
 *
 * @param {Object} config headers and values extracted from Google Sheets.
 * @return {Array} matrix of parameters
 */
export const runtestParamsFromMatrix = ({
  headers,
  matrix
}: {
  headers: string[]
  matrix: any[][]
}) => {
  const matrix_params = matrix.reduce((acc, row) => {
    const params = row
      .map((val, i) => {
        const value = val !== '' ? val : undefined
        return { key: headers[i], value }
      })
      .filter((p) => p.value)
    return acc.concat([params])
  }, [])

  return matrix_params as Param[][]
}
