import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/postgsail.js'

// Types

type JSObj = Record<string, unknown>
type Callback = (argument: unknown) => unknown

interface Response {
  data: any
}
interface Data extends Response {
  ts: number
}

// Config

const ttl = 10 * 60 * 1000, // m * s * ms
  assertions = {
    notArray: [
      (res: any) => Array.isArray(res),
      // De-duplication opportunity in next assertion's message
      (res: any) => 'Wrong API response. Expected array, got ' + typeof res,
    ],
    notPopulatedArray: [
      (res: any) => Array.isArray(res) && res[0],
      (res: any) => 'Wrong API response. Expected populated array, got ' + typeof res,
    ],
  }

// Functions

function resolveAddr(parent: JSObj, addr: string[]): [JSObj, string] {
  return [
    addr.slice(0, -1).reduce(
      (
        parent: JSObj,
        index: string,
        curr: number,
        arr: string[],
        // curr & arr unused; needed to skip TS err
      ) => parent[index] as JSObj,
      parent,
    ),
    addr[addr.length - 1] as string,
  ]
}

// Export

export const useCacheStore = defineStore('cache', {
  state: () => {
    return useStorage('cache', {
      data: {
        logs: { data: [] },
        log_get: [],
        stays: { data: [] },
        moorages: { data: [] },
        stats: new Array(12).fill(0),
        tiles: new Array(3).fill(0),
      },
    })
  },

  actions: {
    async API_get(...addr: string[]): Promise<Response> {
      const api = new PostgSail() as unknown as JSObj,
        endpoint: string = addr[0],
        param: string | undefined = addr[1]
      return (api[endpoint] as Callback)(param) as Promise<Response>
    },

    async getData(addr: string[], assertion: Callback[]) {
      const now: number = new Date().getTime(),
        [parent, index]: [JSObj, string] = resolveAddr(this.data, addr)
      let entry = (parent[index] ?? { ts: 0 }) as Data
      if (navigator.onLine) {
        if (now - entry.ts > ttl) {
          entry = {
            data: ((await this.API_get(...addr)) as Response).data,
            ts: now,
          } as Data
          if (assertion[0](entry.data)) {
            parent[index] = entry
          } else {
            console.error('CacheStore.getData: ' + assertion[1](entry.data))
          }
        }
      } else {
        if (!entry.data) {
          throw 'Offline and uncached; load when online again'
        }
      }
      return (parent[index] as Data).data
    },

    async logs() {
      return await this.getData(['logs'], assertions.notArray)
    },

    async log_get(id: string) {
      return await this.getData(['log_get', id], assertions.notPopulatedArray)
    },

    async moorages() {
      return await this.getData(['moorages'], assertions.notArray)
    },

    async moorage_get(id: string) {
      return await this.getData(['moorage_get', id], assertions.notPopulatedArray)
    },

    async stays() {
      return await this.getData(['stays'], assertions.notArray)
    },

    async stay_get(id: string) {
      return await this.getData(['stay_get', id], assertions.notPopulatedArray)
    },

    InfoTiles() {
      if (this.data.logs && this.data.stays && this.data.moorages) {
        this.data.tiles = [this.data.logs.data.length, this.data.stays.data.length, this.data.moorages.data.length]
      } else {
        this.data.tiles = [0, 0, 0]
      }
    },
    barChart() {
      this.data.stats.fill(0)
      this.data.logs
        ? this.data.logs.data.forEach(({ Started }) => (this.data.stats[new Date(Started).getMonth()] += 1))
        : this.data.stats
    },
    //mixedChart() {},
  },

  getters: {
    getInfoTiles: (state) => state.data.tiles,
    logs_by_month: (state) => state.data.stats,
  },
})
