import defineAPIStore from './defineAPIStore.ts'
import '../data/types.ts'

const ttl: number = (import.meta.env.DEV ? 10 : 60) * 60 * 1000, // m * s * ms,
  assertions: JSObj = {
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

export const useCacheStore = defineAPIStore('cache', {
  state: () => ({
    ttl: ttl,
    logs: [],
    log_get: [],
    stays: [],
    stay_get: [],
    moorages: [],
    moorage_get: [],
    stats: new Array(12).fill(0),
    tiles: new Array(3).fill(0),
    lines: {},
  }),

  actions: {
    async getAPI(endpoint: string, param: string | undefined) {
      const assertion: Callback_1Param =
          endpoint[0].slice(-4) === '_get' ? assertions.notPopulatedArray : assertions.notArray,
        addr: string[] = [endpoint]
      param && addr.push(param)
      return await this.getCached(addr, assertion)
    },

    InfoTiles() {
      if (this.logs && this.stays && this.moorages) {
        this.tiles = [this.logs.length, this.stays.length, this.moorages.length]
      } else {
        this.tiles = [0, 0, 0]
      }
      return this.tiles
    },
    barChart() {
      this.stats.fill(0)
      this.logs ? this.logs.forEach(({ Started }) => (this.stats[new Date(Started).getMonth()] += 1)) : this.stats
      return this.stats
    },
    lineChartbyYear() {
      const obj = {} as JSONObject
      // Extract the year and create a 12 months array
      this.logs.forEach(({ Started }) => (obj[new Date(Started).getFullYear()] = new Array(12).fill(0)))
      // Extract the month and sum the months.
      this.logs.forEach(({ Started }) => (obj[new Date(Started).getFullYear()][new Date(Started).getMonth()] += 1))
      console.log(obj)
      this.lines = obj
      return obj
    },
  },

  getters: {
    getInfoTiles: (state) => state.tiles,
    logs_by_month: (state) => state.stats,
    logs_by_year_by_month: (state) => state.lines,
  },
})
