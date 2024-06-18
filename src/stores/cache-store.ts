import type { JSObj, Callback_1Param, JSONObject } from '../data/types'
import defineAPIStore from './defineAPIStore'
import moment from 'moment'

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
    matrix: [],
    log_tags: [],
    refresh: 'false',
  }),

  actions: {
    async getAPI(endpoint: string, param: string | undefined): Promise<any> {
      const assertion: Callback_1Param =
          endpoint[0].slice(-4) === '_get' ? assertions.notPopulatedArray : assertions.notArray,
        addr: string[] = [endpoint]
      param && addr.push(param)
      return await this.getCached(addr, assertion, this.refresh)
    },
    resetCache() {
      /* There is 2 layers of cache which can lead to confusion.
       * - Application cache using the store
       * - Network cache from browser cache, default 5min from api cache-control headers.
       * Below we reset the storage cache and enforce a request refresh to get the latest content
       */
      this.logs = []
      this.log_get = []
      this.log_tags = []
      this.stays = []
      this.stay_get = []
      this.moorages = []
      this.moorage_get = []
      this.store_ttl = null
      this.refresh = 'true'
      this.getAPI('logs')
      this.getAPI('stays')
      this.getAPI('moorages')
      this.refresh = 'false'
    },

    getTags(): Array<string> {
      this.log_tags = []
      if (Array.isArray(this.logs) && this.logs.length > 0) {
        const tagSet = new Set<string>()
        this.logs.forEach(({ tags }: { tags: Array<string> }) => {
          if (tags) {
            tags.forEach((tag) => {
              tagSet.add(tag)
            })
          }
        })
        this.log_tags = Array.from(tagSet).sort()
      }
      return this.log_tags
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
        ? this.logs.forEach(({ started }: { started: string }) => (this.stats[new Date(started).getMonth()] += 1))
        : this.stats
      return this.stats
    },
    lineChartbyYear(): JSONObject {
      const obj = {} as JSONObject
      // Extract the year and create a 12 months array
      this.logs.forEach(
        ({ started }: { started: string }) => (obj[new Date(started).getFullYear()] = new Array(12).fill(0)),
      )
      // Extract the month and sum the months.
      this.logs.forEach(
        ({ started }: { started: string }) => (obj[new Date(started).getFullYear()][new Date(started).getMonth()] += 1),
      )
      console.log('CacheStore lineChartbyYear obj', obj)
      this.lines = obj
      return obj
    },
    matrixChartbyMonthDay(): Array<string> {
      const obj: { [key: string]: any } = []
      // Create a 12 months array per 7 days array zero fill
      const months = moment.months()
      const weekdays = moment.weekdays()
      for (const [key, value] of Object.entries(months)) {
        //console.log(key, value)
        obj[value] = {}
        for (const [subkey, subvalue] of Object.entries(weekdays)) {
          //console.log(key, value, subkey, subvalue)
          obj[value][subvalue] = 0
        }
      }
      // Sum the days.
      this.logs.forEach(
        ({ started }: { started: string }) =>
          (obj[moment(started).format('MMMM')][moment(started).format('dddd')] += 1),
      )
      // Create the matrix array of json
      // [ { x: 'January', y: 'Sunday', v: 0 }, ..., { x: 'December', y: 'Saturday', v: 0 } ]
      const z: any[] = []
      for (const [key, value] of Object.entries(months)) {
        //console.log(key, value)
        for (const [subkey, subvalue] of Object.entries(weekdays)) {
          //console.log(key, value, subkey, subvalue, obj[value][subvalue])
          z.push({ x: value, y: subvalue, v: obj[value][subvalue] })
        }
      }
      console.log('CacheStore matrixChartbyMonthDay obj', obj)
      this.matrix = z
      return z
    } /*
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
      const start = this.logs[0].started
      const end = this.logs[this.logs.length - 1].Ended
      obj.percentage = (moment.duration(obj.total_duration) / moment.duration(moment(start) - moment(end))) * 100
      obj.total_count = this.logs.length
      console.log('CacheStore pieChartLogs obj', obj)
      return obj
    },
    pieChartStays(): JSONObject {
      let total_duration = 0
      const obj = {
        Unclassified: { duration: 0, percentage: 0 },
        Anchor: { duration: 0, percentage: 0 },
        Buoy: { duration: 0, percentage: 0 },
        Dock: { duration: 0, percentage: 0 },
      }
      // Extract Sum Duration of stays by type
      this.stays.value.forEach(({ stayed_at_id, duration }: { stayed_at_id: number; duration: any }) => {
        total_duration += moment.duration(duration)
        switch (stayed_at_id) {
          case 1:
            obj.Unclassified.duration += moment.duration(duration)
            break
          case 2:
            obj.Anchor.duration += moment.duration(duration)
            break
          case 3:
            obj.Buoy.duration += moment.duration(duration)
            break
          case 4:
            obj.Dock.duration += moment.duration(duration)
            break
          default:
            break
        }
      })
      obj.Unclassified.percentage = (moment.duration(obj.Unclassified.duration) / moment.duration(total_duration)) * 100
      obj.Anchor.percentage = (moment.duration(obj.Anchor.duration) / moment.duration(total_duration)) * 100
      obj.Buoy.percentage = (moment.duration(obj.Buoy.duration) / moment.duration(total_duration)) * 100
      obj.Dock.percentage = (moment.duration(obj.Dock.duration) / moment.duration(total_duration)) * 100
      obj.Unclassified.duration = Math.trunc(moment.duration(obj.Unclassified.duration).as('days'))
      obj.Anchor.duration = Math.trunc(moment.duration(obj.Anchor.duration).as('days'))
      obj.Buoy.duration = Math.trunc(moment.duration(obj.Buoy.duration).as('days'))
      obj.Dock.duration = Math.trunc(moment.duration(obj.Dock.duration).as('days'))
      console.log('pieChartStays obj', obj)
      return obj
    },*/,
  } as JSObj,

  getters: {
    getInfoTiles: (state: JSObj) => state.tiles,
    logs_by_month: (state: JSObj) => state.stats,
    logs_by_year_by_month: (state: JSObj) => state.lines,
    logs_by_month_by_weekday: (state: JSObj) => state.matrix,
    GetLastLogId: (state: JSObj) => (state?.logs && state.logs.length > 1 ? state.logs[0].id : -1),
  },
})
export default useCacheStore
