import i18n from '../i18n'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'
import type { JSObj, Callback_1Param, Response } from '../data/types'
import '../data/types'

const { t } = i18n.global,
  sym_ttl = Symbol('ttl'),
  timestamps: JSObj = {}

/*export async function setTTL(ttl: number, store: string | undefined): Promise<number> {
  store = store ?? (this as JSObj).$id
  if (!store) throw new Error('setTTL: Second parameter {store} or {this.$id} must be provided')
  return timestamps[store][sym_ttl] = ttl
}*/

/*export async function getCached(addr: string[], assertion: Callback_1Param): Promise<any> {
  const now: number = new Date().getTime(),
    endpoint: string = addr[0],
    param: string | undefined = addr[1],
    cache: JSObj = param ? this[endpoint] : this,
    index: string = param ?? endpoint,
    cached: JSObj = cache[index],
    tsStore: JSObj = timestamps[this.$id],
    ts = param ? tsStore[endpoint] ?? (tsStore[endpoint] = {}) : tsStore
  // Promise setup is for when a request is already pending
  if (cached instanceof Promise) return await cached
  // when tsStore[endpoint] is undefined, the resulting NaN yields false:
  if (ts[sym_ttl] > now - ts[index]) return cached
  if (!navigator.onLine) {
    cached && (cache[index] = cached)
    throw new Error(t('api.errors.offlineUncached'))
  }
  return await (cache[index] = API_get(...addr)
    .then((res) => {
      if (!assertion[0](res)) throw new Error(assertion[1](res))
      ts[index] = now
      return (cache[index] = res)
    })
    .catch((err) => {
      console.error(err)
      return (cache[index] = cached)
    }))
}*/

export async function API_get(endpoint: string, param: string | undefined): Promise<Response> {
  const api = new PostgSail() as unknown as JSObj
  return (api[endpoint] as Callback_1Param)(param) as Promise<Response>
}

interface APIStoreDef {
  ttl?: number
  state: () => JSObj
  actions: JSObj
  getters: JSObj
}

export default function defineAPIStore<T extends APIStoreDef>(name: string, def: T): any {
  const state = def.state
  timestamps[name] = { [sym_ttl]: def.ttl }
  delete def.ttl
  def.actions.getCached = async function getCached(addr: string[], assertion: Callback_1Param[]): Promise<any> {
    const now: number = new Date().getTime(),
      endpoint: string = addr[0],
      param: string | undefined = addr[1],
      cache: JSObj = param ? this[endpoint] : this,
      index: string = param ?? endpoint,
      cached: JSObj = cache[index],
      tsStore: JSObj = timestamps[this.$id],
      ts = param ? tsStore[endpoint] ?? (tsStore[endpoint] = {}) : tsStore
    // Promise setup is for when a request is already pending
    if (cached instanceof Promise) return await cached
    // when tsStore[endpoint] is undefined, the resulting NaN yields false:
    if (ts[sym_ttl] > now - ts[index]) return cached
    if (!navigator.onLine) {
      cached && (cache[index] = cached)
      throw new Error(t('api.errors.offlineUncached'))
    }
    return await (cache[index] = API_get(addr[0], addr[1])
      .then((res) => {
        if (!assertion[0](res)) throw new Error(assertion[1](res))
        ts[index] = now
        return (cache[index] = res)
      })
      .catch((err) => {
        console.error(err)
        return (cache[index] = cached)
      }))
  }
  //def.actions.getCached = getCached
  //def.actions.setTTL = setTTL
  def.state = () => useStorage(name, state())
  return defineStore(name, def)
}
