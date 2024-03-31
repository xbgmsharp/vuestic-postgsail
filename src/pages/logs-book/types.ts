export type Log = {
  id: number
  name: string
  from: string
  to: string
  started: string
  ended: string
  fromTime: string
  toTime: string
  distance: number
  duration: string
  _from_moorage_id: number
  _to_moorage_id: number
}

export type Pagination = {
  page: number
  perPage: number
  total: number
}
