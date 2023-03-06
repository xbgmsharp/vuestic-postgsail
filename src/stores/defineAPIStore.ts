import i18n from '../i18n'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/postgsail.js'
import '../data/types.ts'

const { t } = i18n.global,
  sym_ttl = Symbol('ttl'),
  timestamps = {}

export async function setTTL(ttl: number, store: string | undefined) {
  store = store ?? this.$id
  if (!store) throw new Error('setTTL: Second parameter {store} or {this.$id} must be provided')
  timestamps[store][sym_ttl] = ttl
}

export async function API_get(endpoint: string, param: string | undefined): Promise<Response> {
  const api = new PostgSail() as unknown as JSObj
  return (api[endpoint] as Callback)(param) as Promise<Response>
}

export async function getCached(addr: string[], assertion: Callback_1Param): any {
  const now: number = new Date().getTime(),
    endpoint: string = addr[0],
    param: string | undefined = addr[1],
    cache: JSObj = param ? this : this[endpoint],
    index: string = param ?? endpoint,
    cached: JSObj = cache[index],
    tsStore: JSObj = timestamps[this.$id],
    ts = param ? tsStore : tsStore[endpoint]
  if (cached instanceof Promise) return await cached
  // when tsStore[endpoint] is undefined, resulting NaN yields false:
  if (tsStore[sym_ttl] > now - tsStore[index]) return cached
  if (!navigator.onLine) {
    cached && (cache[index] = cached)
    throw new Error(t('api.errors.offlineUncached'))
  }
  return await (cache[index] = API_get(...addr)
    .then(({ data }) => {
      if (!assertion[0](data)) throw new Error(assertion[1](data))
      tsStore[index] = now
      return (cache[index] = data)
    })
    .catch((err) => {
      console.error(err)
      return (cache[index] = cached)
    }))
}

export default function defineAPIStore(name: string, def: { ttl: number }): any {
  const state = def.state
  timestamps[name] = { [sym_ttl]: def.ttl }
  delete def.ttl
  def.actions.getCached = getCached
  def.actions.setTTL = setTTL
  def.state = () => useStorage(name, state())
  return defineStore(name, def)
}
