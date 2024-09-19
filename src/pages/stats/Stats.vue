<template>
  <template v-if="disabled">
    <nodatayet />
  </template>
  <template v-else>
    <div class="grid grid-cols-12 items-start sm:col-span-12 gap-6 mb-3">
      <va-card class="col-span-12 lg:col-span-6 sm:col-span-12 p-2">
        <va-card-title>{{ t('stats.logs') }}</va-card-title>
        <!--
        <va-card-content>
          <table class="va-table va-table--hoverable va-table--striped">
            <tbody>
              <tr>
                <td><b> Date Range </b></td>
                <td>
                  <div class="col-span-12 md:col-span-6 flex">
                    <va-date-input
                      v-model="start_date"
                      :label="$t('logs.list.filter.start_date')"
                      :readonly="false"
                      @update:modelValue="updateStartDate"
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <va-date-input
                      v-model="end_date"
                      :label="$t('logs.list.filter.end_date')"
                      :readonly="false"
                      @update:modelValue="updateEndDate"
                    />
                  </div>
                </td>
              </tr>
              <tr v-for="(value, index) in Object.entries(items_logs)" :key="index">
                <td>
                  <b>{{ $t(`stats.${value[0]}`) }}</b>
                </td>
                <td>{{ value[1] }}</td>
              </tr>
            </tbody>
          </table>
        </va-card-content>
        -->
        <va-card-content>
          <template v-if="apiError">
            <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
          </template>
          <va-inner-loading :loading="isBusy">
            <template v-if="stats_logs && stats_logs.count">
              <table class="va-table va-table--hoverable va-table--striped">
                <tbody>
                  <tr>
                    <td class="va-text-bold">Date Range</td>
                    <td>
                      <va-date-input
                        v-model="stats_logs.first_date"
                        :label="$t('stats.first_date')"
                        :readonly="false"
                        style="width: 200px"
                        @update:modelValue="updateStartDate"
                      />
                      &nbsp;&nbsp;
                      <va-date-input
                        v-model="stats_logs.last_date"
                        :label="$t('stats.last_date')"
                        :readonly="false"
                        style="width: 200px"
                        @update:modelValue="updateEndDate"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class="va-text-bold">{{ $t('stats.name') }}</td>
                    <td>
                      {{ stats_logs.name }}
                    </td>
                  </tr>
                  <tr>
                    <td class="va-text-bold">{{ $t('stats.count') }}</td>
                    <td>
                      {{ stats_logs.count }}
                    </td>
                  </tr>
                  <tr>
                    <td class="va-text-bold">{{ $t('stats.sum_distance') }}</td>
                    <td>
                      <router-link class="va-link link" :to="{ name: 'logs' }">
                        {{ distanceFormatMiles(stats_logs.sum_distance) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td class="va-text-bold">{{ $t('stats.sum_duration') }}</td>
                    <td>
                      <router-link class="va-link link" :to="{ name: 'logs' }">
                        {{ durationI18nDaysHours(stats_logs.sum_duration) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td class="va-text-bold">{{ $t('stats.max_speed') }}</td>
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
                    <td class="va-text-bold">{{ $t('stats.max_wind_speed') }}</td>
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
                    <td class="va-text-bold">{{ $t('stats.longest_nonstop') }}</td>
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
                    <td class="va-text-bold">{{ $t('stats.country') }}</td>
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
                <td class="va-text-bold">{{ $t('stats.home_ports') }}</td>
                <td>{{ stats_moorages.home_ports }}</td>
              </tr>
              <tr>
                <td class="va-text-bold">{{ $t('stats.unique_moorages') }}</td>
                <td>{{ stats_moorages.unique_moorages }}</td>
              </tr>
              <tr>
                <td class="va-text-bold">{{ $t('stats.time_at_home_ports') }}</td>
                <td>{{ durationFormatDays(stats_moorages.time_at_home_ports) }} days</td>
              </tr>
              <!-- TODO: fix when api is fixed -->
              <tr v-if="stats_moorages.time_spent_away">
                <td class="va-text-bold">{{ $t('stats.time_spent_away') }}</td>
                <td>{{ durationFormatDays(stats_moorages.time_spent_away) }} days</td>
              </tr>
              <tr v-for="(value, index) in Object.entries(timeSpentAwayByType)" :key="index">
                <template v-if="value[1].duration > 0">
                  <td class="sub-setting">
                    <b>{{ value[0] }}</b>
                  </td>
                  <td class="flex">
                    <span class="text-center w-1/2">{{ durationFormatDays(value[1].duration) }} days</span>
                    <span class="text-center w-1/2">{{ value[1].percentage }} %</span>
                  </td>
                </template>
              </tr>
              <tr :key="1">
                <td><b> Badges </b></td>
                <td class="badges-stats">
                  <div v-for="(item, key) in userBadges" :key="key">
                    <div v-if="!item.disabled">
                      <img
                        v-if="item.image"
                        class="badges-icon max-h-8 w-[fit-content] mr-1"
                        fit="contain"
                        :src="item.image"
                      />
                      <IconAward v-else-if="item.svg" class="badges-icon max-h-8 w-[fit-content] mr-1" fit="contain" />
                      <IconNavigation v-else class="badges-icon max-h-8 w-[fit-content] mr-1" fit="contain" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 p-4">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content class="h-64">
          <va-chart :data="pieChartDataComputed" type="pie" />
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 p-4">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content class="h-64">
          <va-chart :data="polarChartDataComputed" type="polarArea" :options="polarChartOptions" />
        </va-card-content>
      </va-card>

      <TopBy
        v-if="logsTopByDistance.length > 0"
        :items="logsTopByDistance"
        title="Top Logs by Distance"
        columnvalue="distance"
      />
      <TopBy
        v-if="logsTopByDuration.length > 0"
        :items="logsTopByDuration"
        title="Top Logs by Duration"
        columnvalue="duration"
      />
      <TopBy
        v-if="logsTopByAvgSpeed.length > 0"
        :items="logsTopByAvgSpeed"
        title="Top Logs by Average Speed"
        columnvalue="avg_speed"
      />
      <TopBy
        v-if="logsTopByMaxSpeed.length > 0"
        :items="logsTopByMaxSpeed"
        title="Top Logs by Max Speed"
        columnvalue="max_speed"
      />
      <TopBy
        v-if="logsTopByWindSpeed.length > 0"
        :items="logsTopByWindSpeed"
        title="Top Logs by Max Wind Speed"
        columnvalue="wind_speed"
      />
      <!--
      <div v-if="logs.length > 0" class="col-span-12 lg:col-span-6 sm:col-span-12">
        <TopLogsBy class="w-full" :items="logs" />
      </div>
-->
      <div v-if="moorages.length > 0" class="col-span-12 lg:col-span-6 sm:col-span-12">
        <TopMooragesBy class="w-full" :items="moorages" />
      </div>
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
            size: 18,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const polarChartData_default = {
    labels: ['Unclassified', 'Anchor', 'Mooring Buoys', 'Dock'],
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

  function updateStartDate(new_start_date) {
    // runBusy handles isBusy & apiError
    console.log('updateStartDate', moment.utc(new_start_date).format('YYYY-MM-DD'))
    updateStatsLogs(new_start_date, stats_logs.value.last_date)
  }
  function updateEndDate(new_end_date) {
    // runBusy handles isBusy & apiError
    console.log('updateEndDate', moment.utc(new_end_date).format('YYYY-MM-DD'))
    updateStatsLogs(stats_logs.value.first_date, new_end_date)
  }

  async function updateStatsLogs() {
    //moment(new_end_date.value).format('YYYY-MM-DD')
    const payload = {
      start_date: moment(stats_logs.value.first_date).format('YYYY-MM-DD'),
      end_date: moment(stats_logs.value.last_date).format('YYYY-MM-DD'),
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
    font-weight: 600;
  }
  .badges-stats {
    display: flex;
  }
  .badges-icon {
    width: 32px;
    height: 32px;
  }
</style>
