import type { JSObj, Callback_1Param, JSONObject } from '../data/types'
import defineAPIStore from './defineAPIStore'
//import useGlobalStore from './useGlobalStore'

const assertions: JSObj = {
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
    store_ttl: (import.meta.env.DEV ? 10 : 60) * 60 * 1000, // m * s * ms
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
    async getAPI(endpoint: string, param: string | undefined): Promise<any> {
      const assertion: Callback_1Param =
          endpoint[0].slice(-4) === '_get' ? assertions.notPopulatedArray : assertions.notArray,
        addr: string[] = [endpoint]
      param && addr.push(param)
      return await this.getCached(addr, assertion)
    },

    InfoTiles(): Array<number> {
      if (this.logs && this.stays && this.moorages) {
        this.tiles = [this.logs.length, this.stays.length, this.moorages.length]
      } else {
        this.tiles = [0, 0, 0]
      }
      return this.tiles
    },
    barChart(): Array<number> {
      this.stats.fill(0)
      this.logs
        ? this.logs.forEach(({ Started }: { Started: string }) => (this.stats[new Date(Started).getMonth()] += 1))
        : this.stats
      return this.stats
    },
    lineChartbyYear(): JSONObject {
      const obj = {} as JSONObject
      // Extract the year and create a 12 months array
      this.logs.forEach(
        ({ Started }: { Started: string }) => (obj[new Date(Started).getFullYear()] = new Array(12).fill(0)),
      )
      // Extract the month and sum the months.
      this.logs.forEach(
        ({ Started }: { Started: string }) => (obj[new Date(Started).getFullYear()][new Date(Started).getMonth()] += 1),
      )
      console.log('CacheStore lineChartbyYear obj', obj)
      this.lines = obj
      return obj
    },
    /*
    pieChartLogs(): JSONObject {
      const obj = {
        total_duration: [] as number[],
        total_distance: 0,
        total_count: 0,
        max_duration_id: 0,
        max_distance_id: 0,
        max_duration: [] as number[],
        max_distance: 0,
        percentage: 0,
      }
      // Extract Sum Distances,Sum Duration of logs
      this.logs.forEach(({ id, Distance, Duration }: { id: number; Distance: number; Duration: number }) => {
        obj.total_distance += Distance
        //obj.total_duration += moment.duration(Duration)
        obj.total_duration = moment.duration(Duration) + moment.duration(obj.total_duration)
        if (Math.max(Distance, obj.max_distance)) {
          obj.max_distance_id = id
          obj.max_distance = Math.max(Distance, obj.max_distance)
        }
        if (moment.duration(Duration) > moment.duration(obj.max_duration)) {
          obj.max_duration_id = id
          obj.max_duration = moment.duration(Duration)
        }
      })
      //obj.total_duration = moment.duration(obj.total_duration).humanize()
      const start = this.logs[0].Started
      const end = this.logs[this.logs.length - 1].Ended
      obj.percentage = (moment.duration(obj.total_duration) / moment.duration(moment(start) - moment(end))) * 100
      obj.total_count = this.logs.length
      console.log('CacheStore pieChartLogs obj', obj)
      return obj
    },
    pieChartStays(): JSONObject {
      const obj = {}
      // Extract Sum Distances,Sum Duration of logs
      //this.stays.forEach(({ id, Distance, Duration }) => {})
      console.log('CacheStore pieChartStays obj', obj)
      return obj
    },*/
  } as JSObj,

  getters: {
    getInfoTiles: (state: JSObj) => state.tiles,
    logs_by_month: (state: JSObj) => state.stats,
    logs_by_year_by_month: (state: JSObj) => state.lines,
  },
})
export default useCacheStore
