import i18n from '../i18n'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/postgsail.js'
import '../data/types.ts'

const { t } = i18n.global,
  ts = {}

export async function API_get(endpoint: string, param: string | undefined): Promise<Response> {
  const api = new PostgSail() as unknown as JSObj
  return (api[endpoint] as Callback)(param) as Promise<Response>
}

export async function getData([endpoint, param]: string[], assertion: Callback_1Param[]) {
  const now: number = new Date().getTime(),
    cached = param ? this[endpoint] : this[endpoint][param]
  if (cached instanceof Promise) return await cached
  // when ts[enpoint] is undefined, NaN yields false:
  if (!(this.ttl > now - ts[endpoint])) {
    parent[index] = {}
  } else if (parent[index]?.ts) {
    return parent[index].data
  }
  if (!navigator.onLine) {
    cached?.ts && (parent[index] = cached)
    throw t('api.errors.offlineUncached')
  }
  return await (parent[index] = {
    data: API_get(...addr)
      .then(({ data }) => {
        if (!assertion[0](data)) throw assertion[1](data)
        return (parent[index].data = data)
      })
      .catch((err) => {
        console.error(err)
        return (parent[index] = cached).data
      }),
    /*data: API_get(...addr).then(({ data }) => {
      if (assertion[0](data)) { return parent[index].data = data }
      const err = assertion[1](data)
      if (!cached) throw err
      console.error(err)
      return parent[index] = cached
    }).catch(err => {
      console.error('Error in defineAPIStore getData: ', err)
      return parent[index] = cached
    }),*/
    ts: now,
  } as Data).data
}

export default function defineAPIStore(name: string, def: { ttl: number }): any {
  const state = def.state
  def.actions.getData = getData
  def.state = () => useStorage(name, state())
  return defineStore(name, def)
}
