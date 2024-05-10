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

const { t } = i18n.global

export async function API_get(endpoint: string, param?: string, refresh?: string): Promise<Response> {
  console.log('API_get', param, refresh)
  const api = new PostgSail() as unknown as JSObj
  // Disable browser cache
  if (refresh === 'true') {
    api.setHeader('pragma', 'no-cache')
    api.setHeader('cache-control', 'no-cache')
  } else {
    api.delHeader('pragma')
    api.delHeader('cache-control')
  }
  return (api[endpoint] as Callback_1Param)(param) as Promise<Response>
}

export default function defineAPIStore(name: string, def: APIStoreDef): StoreDefinition {
  const origState = def.state
  def.state = () => {
    const state = origState()
    state.timestamps = {}
    return useStorage(name, state, localStorage, { mergeDefaults: true })
  }
  /*def.actions.api = new Proxy(new PostgSail() as unknown as JSObj, {
    get(...args) {
      //console.debug('PostgSail Proxy args', ...args)
    },
  })*/
  def.actions.getCached = async function getCached(
    addr: string[],
    assertion: Callback_1Param[],
    refresh: string | undefined,
  ): Promise<any> {
    const endpoint: string = addr[0],
      param: string | undefined = addr[1],
      cache: JSObj = param ? this[endpoint] : this,
      index: string = param ?? endpoint,
      cached: JSObj = cache[index]
    // Promise setup is for when a request is already pending
    if (cached instanceof Promise) return await cache[index]
    //console.log('getCached param', param, '' ,this.timestamps)
    const now: number = new Date().getTime(),
      ts = param ? this.timestamps[endpoint] ?? (this.timestamps[endpoint] = {}) : this.timestamps
    // when ts is undefined, the resulting NaN yields false:
    if (this.store_ttl > now - ts[index]) return cached
    if (!navigator.onLine) throw new Error(t('api.errors.offlineUncached'))
    //console.log('getCached', refresh, param, ts, this.timestamps)
    return await (cache[index] = API_get(addr[0], addr[1], refresh)
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
