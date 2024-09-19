<template>
  <template v-if="disabled">
    <nodatayet />
  </template>
  <template v-else>
    <va-card class="col-span-12 lg:col-span-6 sm:col-span-12 p-2 mb-3">
      <va-card-title>Statistics for {{ stats_logs.name }} </va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <va-inner-loading :loading="isBusy">
          <template v-if="stats_logs && stats_logs.count">
            <div class="gap-4 mb-4">
              <div class="mb-2">Date Range:</div>
              <div class="w-64">
                <va-date-input v-model="dateRange" mode="range" @update:modelValue="updateDateRange" />
              </div>
            </div>
            <div>
              <div class="mb-2">Badges Awarded:</div>
              <div class="badges-stats">
                <div v-for="(item, key) in userBadges" :key="key">
                  <div v-if="!item.disabled">
                    <va-popover :message="key">
                      <va-image
                        v-if="item.image"
                        class="badges-icon max-h-8 w-[fit-content] mr-1"
                        fit="contain"
                        :src="item.image"
                      />
                      <icon-award v-else-if="item.svg" class="badges-icon max-h-8 w-[fit-content] mr-1" fit="contain" />
                      <icon-navigation v-else class="badges-icon max-h-8 w-[fit-content] mr-1" fit="contain" />
                    </va-popover>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
    <div class="grid grid-cols-12 items-start sm:col-span-12 gap-6 mb-3">
      <va-card class="col-span-12 lg:col-span-6 sm:col-span-12 p-2">
        <va-card-title>{{ t('stats.logs') }}</va-card-title>
        <va-card-content>
          <template v-if="apiError">
            <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
          </template>
          <va-inner-loading :loading="isBusy">
            <template v-if="stats_logs && stats_logs.count">
              <table class="va-table va-table--hoverable va-table--striped">
                <tbody>
                  <tr>
                    <td>{{ $t('stats.count') }}</td>
                    <td>
                      <router-link class="va-link link" :to="{ name: 'logs' }">
                        {{ stats_logs.count }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.sum_distance') }}</td>
                    <td>
                      <router-link class="va-link link" :to="{ name: 'logs' }">
                        {{ distanceFormatMiles(stats_logs.sum_distance) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.sum_duration') }}</td>
                    <td>
                      <router-link class="va-link link" :to="{ name: 'logs' }">
                        {{ durationI18nDaysHours(stats_logs.sum_duration) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.max_speed') }}</td>
                    <td>
                      <router-link
                        class="va-link link"
                        :to="{ name: 'log-map', params: { id: stats_logs.max_speed_id } }"
                      >
                        {{ speedFormatKnots(stats_logs.max_speed) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.max_wind_speed') }}</td>
                    <td>
                      <router-link
                        class="va-link link"
                        :to="{ name: 'log-map', params: { id: stats_logs.max_wind_speed_id } }"
                      >
                        {{ speedFormatKnots(stats_logs.max_wind_speed) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.longest_nonstop') }}</td>
                    <td>
                      <router-link
                        class="va-link link"
                        :to="{ name: 'log-map', params: { id: stats_logs.max_distance_id } }"
                      >
                        {{ distanceFormatMiles(stats_logs.max_distance) }}
                      </router-link>
                      /
                      <router-link
                        class="va-link link"
                        :to="{ name: 'log-map', params: { id: stats_logs.max_duration_id } }"
                      >
                        {{ durationI18nDaysHours(stats_logs.max_duration) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.country') }}</td>
                    <td>
                      <div>
                        <va-icon
                          v-for="country in vessel_stats.moorages_top_countries"
                          :key="country"
                          :name="getFlagIcon(country.toLocaleLowerCase(), 'small')"
                          class="badges-icon max-h-8 w-[fit-content] mr-1"
                          fit="contain"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
          </va-inner-loading>
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 sm:col-span-12 p-2">
        <va-card-title>{{ t('stats.moorages') }}</va-card-title>
        <va-card-content>
          <table class="va-table va-table--hoverable va-table--striped">
            <tbody>
              <tr>
                <td>{{ $t('stats.home_ports') }}</td>
                <td>
                  <router-link class="va-link link" :to="{ name: 'moorages' }">
                    {{ stats_moorages.home_ports }}
                  </router-link>
                </td>
              </tr>
              <tr>
                <td>{{ $t('stats.unique_moorages') }}</td>
                <td>
                  <router-link class="va-link link" :to="{ name: 'moorages' }">
                    {{ stats_moorages.unique_moorages }}
                  </router-link>
                </td>
              </tr>
              <tr>
                <td>{{ $t('stats.time_at_home_ports') }}</td>
                <td>
                  <router-link class="va-link link" :to="{ name: 'stays' }">
                    {{ durationFormatDays(stats_moorages.time_at_home_ports) }} days
                  </router-link>
                </td>
              </tr>
              <tr>
                <td>{{ $t('stats.time_spent_away') }}</td>
                <td>
                  <router-link class="va-link link" :to="{ name: 'stays' }">
                    {{ durationFormatDays(stats_moorages.time_spent_away) }} days
                  </router-link>
                </td>
              </tr>
              <tr v-for="(value, index) in Object.entries(timeSpentAwayByType)" :key="index">
                <template v-if="value[1].duration > 0">
                  <td class="sub-setting">{{ value[0] }}</td>
                  <td class="flex">
                    <span class="text-center w-1/2">
                      <router-link class="va-link link" :to="{ name: 'stays' }">
                        {{ durationFormatDays(value[1].duration) }} days
                      </router-link>
                    </span>
                    <span class="text-center w-1/2">
                      <router-link class="va-link link" :to="{ name: 'stays' }">
                        {{ value[1].percentage }} %
                      </router-link>
                    </span>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 p-2">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content class="h-64">
          <va-chart :data="pieChartDataComputed" type="pie" />
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 p-2">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content class="h-64">
          <va-chart :data="polarChartDataComputed" type="polarArea" :options="polarChartOptions" />
        </va-card-content>
      </va-card>

      <top-by
        v-if="logsTopByDistance.length > 0"
        :items="logsTopByDistance"
        title="Top Logs by Distance"
        columnvalue="distance"
      />
      <top-by
        v-if="logsTopByDuration.length > 0"
        :items="logsTopByDuration"
        title="Top Logs by Duration"
        columnvalue="duration"
      />
      <top-by
        v-if="logsTopByAvgSpeed.length > 0"
        :items="logsTopByAvgSpeed"
        title="Top Logs by Average Speed"
        columnvalue="avg_speed"
      />
      <top-by
        v-if="logsTopByMaxSpeed.length > 0"
        :items="logsTopByMaxSpeed"
        title="Top Logs by Max Speed"
        columnvalue="max_speed"
      />
      <top-by
        v-if="logsTopByWindSpeed.length > 0"
        :items="logsTopByWindSpeed"
        title="Top Logs by Max Wind Speed"
        columnvalue="wind_speed"
      />
      <top-moorages-by
        v-if="mooragesTopByDuration.length > 0"
        :items="mooragesTopByDuration"
        title="Top Moorages by Stay Duration"
        columnvalue="duration"
      />
      <top-moorages-by
        v-if="mooragesTopByArrivals.length > 0"
        :items="mooragesTopByArrivals"
        title="Top Moorages by Arrivals"
        columnvalue="arrivals"
      />
    </div>

    <div class="box layout gutter--md" style="text-align: center">
      <a
        :href="`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fiot.openplotter.cloud%2F${publicVessel}%2Fstats`"
        target="_blank"
        ><va-icon name="facebook" :size="44"
      /></a>
      <template v-if="instagram">
        <a :href="`https://www.instagram.com/${instagram}/`" target="_blank">
          <va-icon name="instagram" :size="44"
        /></a>
      </template>
      <a
        :href="`https://twitter.com/intent/tweet?text=${publicVessel}'s Stats&url=https%3A%2F%2Fiot.openplotter.cloud/${publicVessel}/stats`"
        target="_blank"
      >
        <va-icon name="x-twitter" :size="44"
      /></a>
      <a
        :href="`mailto:?subject=${publicVessel}'s Stats&body=Awesome stats%0D%0A%0D%0Ahttps://iot.openplotter.cloud/${publicVessel}/stats`"
        target="_blank"
        ><va-icon name="envelope" :size="44"
      /></a>
      <template v-if="website">
        <a :href="website" target="_blank"><va-icon name="share" :size="44" /></a>
      </template>
    </div>
  </template>
</template>

<script setup>
  import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  //import nodatayet from '../../components/noDataScreen.vue'
  //import VaChart from '../../components/va-charts/VaChart.vue'
  const nodatayet = defineAsyncComponent(() => import('../../components/noDataScreen.vue'))
  const VaChart = defineAsyncComponent(() => import('../../components/va-charts/VaChart.vue'))
  import { useGlobalStore } from '../../stores/global-store'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import moment from 'moment/min/moment-with-locales'
  //import IconAward from '../../components/icons/IconAward.vue'
  //import IconNavigation from '../../components/icons/IconNavigation.vue'
  const IconAward = defineAsyncComponent(() => import('../../components/icons/IconAward.vue'))
  const IconNavigation = defineAsyncComponent(() => import('../../components/icons/IconNavigation.vue'))
  //import { asBusy } from '../../utils/handleExports'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { durationI18nDaysHours, durationFormatDays } from '../../utils/dateFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  const { isLoggedIn, publicVessel, instagram, website } = useGlobalStore()
  //import stats_logs from '../../data/stats_logs.json'
  //import stats_moorages from '../../data/stats_moorages.json'
  import TopBy from './Cards/TopBy.vue'
  //import TopLogsBy from './Cards/TopLogsBy.vue'
  import TopMooragesBy from './Cards/TopMooragesBy.vue'

  const { t } = useI18n()
  const GlobalStore = useGlobalStore()
  const { userBadges } = storeToRefs(GlobalStore)
  const CacheStore = useCacheStore()
  const { logs, stays, moorages } = storeToRefs(CacheStore)

  const isBusy = ref(false)
  const apiError = ref(null)

  const vessel_stats = ref({})
  const stats_logs = ref({})
  const stats_moorages = ref({})
  const dateRange = ref(null)

  function getFlagIcon(code, size) {
    return `flag-icon-${code} ${size}`
  }

  /* TODO
   * Date formatting
   * Add i18n for all entries
   * Chart.js Label percentage % or value
   * Which graph type?
   */
  const polarChartOptions = {
    responsive: true,
    scales: {
      r: {
        pointLabels: {
          display: true,
          centerPointLabels: true,
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  const polarChartData_default = {
    labels: ['Unknown', 'Anchor', 'Mooring Buoy', 'Dock'],
    datasets: [
      {
        data: [45, 5, 9, 20],
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)'],
        borderWidth: 1,
      },
    ],
  }

  const pieChartData_default = {
    labels: ['Not Underway', 'Underway'],
    datasets: [
      {
        data: [51.5, 48.5],
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)'],
        borderWidth: 1,
      },
    ],
  }

  const polarChartDataComputed = computed(() => {
    if (!Array.isArray(stays.value) || stays.value.length == 0) return polarChartData_default
    const obj = structuredClone(polarChartData_default)
    obj.datasets[0].data = [
      polarChartStays.value.Unclassified.percentage,
      polarChartStays.value.Anchor.percentage,
      polarChartStays.value.Buoy.percentage,
      polarChartStays.value.Dock.percentage,
    ]
    return obj
  })

  const pieChartDataComputed = computed(() => {
    if (!Array.isArray(logs.value) || logs.value.length == 0) return pieChartData_default
    const obj = structuredClone(pieChartData_default)
    obj.datasets[0].data = [100 - pieChartLogs.value.percentage, pieChartLogs.value.percentage]
    return obj
  })

  const pieChartLogs = computed(() => {
    if (!Array.isArray(logs.value) || logs.value.length == 0) return {}
    const obj = {
      total_duration: null,
      total_distance: 0,
      total_count: 0,
      max_duration_id: 0,
      max_distance_id: 0,
      max_duration: null,
      max_distance: 0,
      percentage: 0,
    }
    // Extract Sum Distances,Sum Duration of logs
    logs.value.forEach(({ id, distance, duration }) => {
      obj.total_distance += distance
      //obj.total_duration += moment.duration(Duration)
      obj.total_duration = moment.duration(duration) + moment.duration(obj.total_duration)
      if (Math.max(distance, obj.max_distance)) {
        obj.max_distance_id = id
        obj.max_distance = Math.max(distance, obj.max_distance)
      }
      if (moment.duration(duration) > moment.duration(obj.max_duration)) {
        obj.max_duration_id = id
        obj.max_duration = moment.duration(duration)
      }
    })
    //obj.total_duration = moment.duration(obj.total_duration).humanize()
    const start = logs.value[0].started
    const end = logs.value[logs.value.length - 1].Ended
    obj.percentage = (moment.duration(obj.total_duration) / moment.duration(moment(start) - moment(end))) * 100
    obj.total_count = logs.value.length
    console.log('pieChartLogs obj', obj)
    return obj
  })

  const polarChartStays = computed(() => {
    if (!Array.isArray(stays.value) || stays.value.length == 0) return {}
    let total_duration = 0
    const obj = {
      Unclassified: { duration: 0, percentage: 0 },
      Anchor: { duration: 0, percentage: 0 },
      Buoy: { duration: 0, percentage: 0 },
      Dock: { duration: 0, percentage: 0 },
    }
    // Extract Sum Duration of stays by type
    stays.value.forEach(({ stayed_at_id, duration }) => {
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
    obj.Unclassified.percentage = (
      (moment.duration(obj.Unclassified.duration) / moment.duration(total_duration)) *
      100
    ).toFixed(2)
    obj.Anchor.percentage = ((moment.duration(obj.Anchor.duration) / moment.duration(total_duration)) * 100).toFixed(2)
    obj.Buoy.percentage = ((moment.duration(obj.Buoy.duration) / moment.duration(total_duration)) * 100).toFixed(2)
    obj.Dock.percentage = ((moment.duration(obj.Dock.duration) / moment.duration(total_duration)) * 100).toFixed(2)
    obj.Unclassified.duration = Math.trunc(moment.duration(obj.Unclassified.duration).as('days'))
    obj.Anchor.duration = Math.trunc(moment.duration(obj.Anchor.duration).as('days'))
    obj.Buoy.duration = Math.trunc(moment.duration(obj.Buoy.duration).as('days'))
    obj.Dock.duration = Math.trunc(moment.duration(obj.Dock.duration).as('days'))
    console.log('pieChartStays obj', obj)
    return obj
  })

  const timeSpentAwayByType = computed(() => {
    if (
      !stats_moorages.value ||
      !Array.isArray(stats_moorages.value.time_spent_away_arr) ||
      stats_moorages.value.time_spent_away_arr.length == 0
    )
      return {}
    let total_duration = 0
    const obj = {
      Unclassified: { duration: 0, percentage: 0 },
      Anchor: { duration: 0, percentage: 0 },
      Buoy: { duration: 0, percentage: 0 },
      Dock: { duration: 0, percentage: 0 },
    }
    // Extract Sum Duration of stays by type
    stats_moorages.value.time_spent_away_arr.forEach((entry) => {
      total_duration += moment.duration(entry.stay_duration)
      switch (entry.stay_code) {
        case 1:
          obj.Unclassified.duration += moment.duration(entry.stay_duration)
          break
        case 2:
          obj.Anchor.duration += moment.duration(entry.stay_duration)
          break
        case 3:
          obj.Buoy.duration += moment.duration(entry.stay_duration)
          break
        case 4:
          obj.Dock.duration += moment.duration(entry.stay_duration)
          break
        default:
          break
      }
    })
    obj.Unclassified.percentage = (
      (moment.duration(obj.Unclassified.duration) / moment.duration(total_duration)) *
      100
    ).toFixed(2)
    obj.Anchor.percentage = ((moment.duration(obj.Anchor.duration) / moment.duration(total_duration)) * 100).toFixed(2)
    obj.Buoy.percentage = ((moment.duration(obj.Buoy.duration) / moment.duration(total_duration)) * 100).toFixed(2)
    obj.Dock.percentage = ((moment.duration(obj.Dock.duration) / moment.duration(total_duration)) * 100).toFixed(2)
    return obj
  })

  const disabled = computed(() => {
    //console.log('disabled logs', logs.value)
    //console.log('disabled stays', stays.value)
    if (!Array.isArray(logs.value) || logs.value.length == 0) return true
    if (!Array.isArray(stays.value) || stays.value.length == 0) return true
    return false
  })

  // TopBy listing
  const tripMap = computed(() => new Map(logs.value.map((trip) => [trip.id, trip])))

  const logsTopByAvgSpeed = computed(() => {
    if (!Array.isArray(vessel_stats.value.logs_top_avg_speed) || vessel_stats.value.logs_top_avg_speed.length === 0)
      return []
    if (!Array.isArray(logs.value) || logs.value.length === 0) return []

    return vessel_stats.value.logs_top_avg_speed
      .map((match) => {
        const trip = tripMap.value.get(match.id)
        if (trip) {
          return {
            ...trip,
            avg_speed: speedFormatKnots(match.avg_speed),
          }
        }
        return null
      })
      .filter((trip) => trip !== null)
  })
  const logsTopByMaxSpeed = computed(() => {
    if (!Array.isArray(vessel_stats.value.logs_top_speed) || vessel_stats.value.logs_top_speed.length === 0) return []
    if (!Array.isArray(logs.value) || logs.value.length === 0) return []

    return vessel_stats.value.logs_top_speed
      .map((match) => {
        const trip = tripMap.value.get(match.id)
        if (trip) {
          return {
            ...trip,
            max_speed: speedFormatKnots(match.max_speed),
          }
        }
        return null
      })
      .filter((trip) => trip !== null)
  })
  const logsTopByWindSpeed = computed(() => {
    if (!Array.isArray(vessel_stats.value.logs_top_wind_speed) || vessel_stats.value.logs_top_wind_speed.length === 0)
      return []
    if (!Array.isArray(logs.value) || logs.value.length === 0) return []

    const tripMap = new Map(logs.value.map((trip) => [trip.id, trip]))
    return vessel_stats.value.logs_top_wind_speed
      .map((match) => {
        const trip = tripMap.get(match.id)
        if (trip) {
          return {
            ...trip,
            wind_speed: speedFormatKnots(match.max_wind_speed),
          }
        }
        return null
      })
      .filter((trip) => trip !== null)
  })
  const logsTopByDistance = computed(() => {
    if (!Array.isArray(vessel_stats.value.logs_top_distance) || vessel_stats.value.logs_top_distance.length === 0)
      return []
    if (!Array.isArray(logs.value) || logs.value.length === 0) return []

    return vessel_stats.value.logs_top_distance
      .map((id) => {
        const trip = tripMap.value.get(id)
        if (trip) {
          return {
            ...trip,
            distance: distanceFormatMiles(trip.distance),
          }
        }
        return null
      })
      .filter((trip) => trip !== null)
  })
  const logsTopByDuration = computed(() => {
    if (!Array.isArray(vessel_stats.value.logs_top_duration) || vessel_stats.value.logs_top_duration.length === 0)
      return []
    if (!Array.isArray(logs.value) || logs.value.length === 0) return []

    return vessel_stats.value.logs_top_duration
      .map((id) => {
        const trip = tripMap.value.get(id)
        if (trip) {
          return {
            ...trip,
            duration: durationI18nDaysHours(trip.duration),
          }
        }
        return null
      })
      .filter((trip) => trip !== null)
  })

  // TopMooragesBy listing
  const moorageMap = computed(() => new Map(moorages.value.map((moorage) => [moorage.id, moorage])))

  const mooragesTopByDuration = computed(() => {
    if (
      !Array.isArray(vessel_stats.value.moorages_top_duration) ||
      vessel_stats.value.moorages_top_duration.length === 0
    )
      return []
    if (!Array.isArray(moorages.value) || moorages.value.length === 0) return []

    return vessel_stats.value.moorages_top_duration
      .map((match) => {
        const moorage = moorageMap.value.get(match.id)
        if (moorage) {
          return {
            ...moorage,
            duration: durationI18nDaysHours(match.dur),
          }
        }
        return null
      })
      .filter((moorage) => moorage !== null)
  })
  const mooragesTopByArrivals = computed(() => {
    if (
      !Array.isArray(vessel_stats.value.moorages_top_arrivals) ||
      vessel_stats.value.moorages_top_arrivals.length === 0
    )
      return []
    if (!Array.isArray(moorages.value) || moorages.value.length === 0) return []

    return vessel_stats.value.moorages_top_arrivals
      .map((match) => {
        const moorage = moorageMap.value.get(match.id)
        if (moorage) {
          return {
            ...moorage,
            arrivals: match.ref_count,
          }
        }
        return null
      })
      .filter((moorage) => moorage !== null)
  })

  onMounted(async () => {
    console.log('Stats onMounted')
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      let response = null
      /*
      let response = await api.stats_logs_view()
      if (Array.isArray(response) && response[0]) {
        stats_logs.value = response[0]
        console.log(stats_logs.value, 'stats_logs')
      }
      response = await api.stats_moorages_view()
      if (Array.isArray(response) && response[0]) {
        stats_moorages.value = response[0]
      }
      */
      // Get logs
      if (logs.value.length === 0) {
        response = await CacheStore.getAPI('logs')
        console.log('Get logs', response)
      }
      // Get stays
      if (stays.value.length === 0) {
        response = await CacheStore.getAPI('stays')
        console.log('Get stays', response)
      }
      // Get moorages
      if (moorages.value.length === 0) {
        response = await CacheStore.getAPI('moorages')
        console.log('Get moorages', response)
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        stats_logs.value = 2 //stats_logs[0]
        stats_moorages.value = 1 //stats_moorages[0]
      }
      return
    } finally {
      isBusy.value = false
    }
    console.log('logs', logs.value)
    console.log('moorages', moorages.value)

    try {
      let response = await api.stats()
      if (response.stats) {
        console.log('stats success', response)
        vessel_stats.value = response.stats
        stats_logs.value = response.stats.stats_logs
        stats_moorages.value = response.stats.stats_moorages
        dateRange.value = { start: stats_logs.value.first_date, end: stats_logs.value.last_date }
      } else {
        throw { response }
      }
    } catch (err) {
      // If exit as we need coordinates
      console.log('stats failed', err)
      return
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }
    // userBadges
    console.log('stats userBadges', userBadges.value)
  })

  function updateDateRange(range) {
    // runBusy handles isBusy & apiError
    console.log('updateDateRange', range)
    updateStatsLogs()
  }

  async function updateStatsLogs() {
    const payload = {
      start_date: moment(dateRange.value.start).format('YYYY-MM-DD'),
      end_date: moment(dateRange.value.end).format('YYYY-MM-DD'),
    }
    try {
      const api = new PostgSail()
      let response = await api.stats(payload)
      if (response.stats) {
        console.log('updateStatsLogs success', response)
        vessel_stats.value = response.stats
        stats_logs.value = response.stats.stats_logs
        stats_moorages.value = response.stats.stats_moorages
      } else {
        throw { response }
      }
    } catch (err) {
      // If exit as we need coordinates
      console.log('updateStatsLogs failed', err)
      return
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }
  }
</script>

<style lang="scss" scoped>
  @import 'flag-icons/css/flag-icons.css';
  .va-input .va-input-wrapper {
    width: 200px;
  }
  .va-table-responsive {
    overflow: auto;
  }
  .va-table {
    width: 100%;
  }
  .sub-setting {
    padding-left: 2em;
    font-size: 0.9rem;
  }
  .badges-stats {
    display: flex;
  }
  .badges-icon {
    width: 32px;
    height: 32px;
  }
</style>
