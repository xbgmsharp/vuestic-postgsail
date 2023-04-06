import i18n from '../i18n'
import { defineStore } from 'pinia'
import type { StoreDefinition } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'
import type { JSObj, Callback_1Param, Response } from '../data/types'
import '../data/types'

interface APIStoreDef {
  state: () => JSObj
  actions: JSObj
  getters: JSObj
}

const { t } = i18n.global,
  sym_ttl = Symbol('ttl'),
  timestamps: JSObj = {}

export async function API_get(endpoint: string, param?: string): Promise<Response> {
  const api = new PostgSail() as unknown as JSObj
  return (api[endpoint] as Callback_1Param)(param) as Promise<Response>
}

export default function defineAPIStore(name: string, ttl: number, def: APIStoreDef): StoreDefinition {
  const state = def.state
  timestamps[name] = { [sym_ttl]: ttl }
  def.state = () => useStorage(name, state(), localStorage, { mergeDefaults: true })

  def.actions.getCached = async function getCached(addr: string[], assertion: Callback_1Param[]): Promise<any> {
    const endpoint: string = addr[0],
      param: string | undefined = addr[1],
      cache: JSObj = param ? this[endpoint] : this,
      index: string = param ?? endpoint,
      cached: JSObj = cache[index]
    // Promise setup is for when a request is already pending
    if (cached instanceof Promise) return await cache[index]
    const now: number = new Date().getTime(),
      tsStore: JSObj = timestamps[this.$id],
      ts = param ? tsStore[endpoint] ?? (tsStore[endpoint] = {}) : tsStore
    // when ts is undefined, the resulting NaN yields false:
    if (ts[sym_ttl] > now - ts[index]) return cached
    if (!navigator.onLine) throw new Error(t('api.errors.offlineUncached'))
    return await (cache[index] = API_get(addr[0], addr[1])
      .then((res: Record<string, any>) => {
        if (!assertion[0](res)) throw new Error(assertion[1](res))
        ts[index] = now
        cache[index] = res
        return cache[index]
      })
      .catch((err: Error) => {
        console.warn(err)
        cache[index] = cached
        return cache[index]
      }))
  }
  return defineStore(name, def)
}
