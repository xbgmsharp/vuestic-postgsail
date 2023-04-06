import i18n from '../i18n'
import { defineStore } from 'pinia'
import type { StoreDefinition, DefineStoreOptions } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'
import type { JSObj, Callback_1Param, Response } from '../data/types'
import '../data/types'

const { t } = i18n.global,
  sym_ttl = Symbol('ttl'),
  timestamps: JSObj = {}

interface APIStoreDef {
  state: () => JSObj
  actions: JSObj
  getters: JSObj
}

const APIStoreDefinition: JSObj = {
  create(name: string, ttl: number, def: APIStoreDef) {
    const { state, actions } = def
    timestamps[name] = { [sym_ttl]: ttl }
    def.state = () => useStorage(name, state(), localStorage, { mergeDefaults: true })
    def.actions.getCached = APIStoreDefinition.getCached
    def.actions.API_get = APIStoreDefinition.API_get
    return def
  },

  async API_get(endpoint: string, param?: string): Promise<Response> {
    const api = new PostgSail() as unknown as JSObj
    return (api[endpoint] as Callback_1Param)(param) as Promise<Response>
  },

  async getCached(addr: string[], assertion: Callback_1Param[]): Promise<any> {
    const endpoint: keyof this = addr[0],
      param: string | undefined = addr[1],
      cache: JSObj = param ? this[endpoint] : this,
      index: string = param ?? endpoint,
      cached: JSObj = cache[index]
    // Promise setup is for when a request is already pending
    if (cached instanceof Promise) return await cached
    // when tsStore[endpoint] is undefined, the resulting NaN yields false:
    const now: number = new Date().getTime(),
      tsStore: JSObj = timestamps[this.$id],
      ts = param ? tsStore[endpoint] ?? (tsStore[endpoint] = {}) : tsStore
    if (ts[sym_ttl] > now - ts[index]) return cached
    if (!navigator.onLine) {
      cached && (cache[index] = cached)
      throw new Error(t('api.errors.offlineUncached'))
    }
    return await (cache[index] = APIStoreDefinition.API_get(addr[0], addr[1])
      .then((res) => {
        if (!assertion[0](res)) throw new Error(assertion[1](res))
        ts[index] = now
        return (cache[index] = res)
      })
      .catch((err) => {
        console.warn(err)
        return (cache[index] = cached)
      }))
  },
}

export default function defineAPIStore(name: string, ttl: number, def: APIStoreDef): StoreDefinition {
  const store = defineStore(name, APIStoreDefinition.create(name, ttl, def))
  return store
  //return defineStore(name, APIStoreDefinition.create(name, ttl, def))
}

/*
src/stores/defineAPIStore.ts:41:27 - error TS2526: A 'this' type is available only in a non-static member of a class or interface.

41     const endpoint: keyof this = addr[0],
                             ~~~~

src/stores/defineAPIStore.ts:58:14 - error TS7006: Parameter 'res' implicitly has an 'any' type.

58       .then((res) => {
                ~~~

src/stores/defineAPIStore.ts:63:15 - error TS7006: Parameter 'err' implicitly has an 'any' type.

63       .catch((err) => {
                 ~~~


Found 3 errors in the same file, starting at: src/stores/defineAPIStore.ts:41
*/
