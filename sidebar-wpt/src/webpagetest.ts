export interface Param {
  key: string
  value: string | number | boolean
}

export interface WebPageTestProfile {
  checked?: boolean
  id: string
  name: string
  'row-index': number
  params: Param[]
}
