<template>
  <template v-if="disabled">
    <nodatayet />
  </template>
  <template v-else>
    <va-card class="col-span-12 lg:col-span-6 sm:col-span-12 p-2 mb-3">
      <va-card-title>{{ $t('stats.stats') }} {{ stats_logs.name }} </va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <va-inner-loading :loading="isBusy">
          <template v-if="stats_logs && stats_logs.count">
            <div class="gap-4 mb-4">
              <div class="mb-2">{{ $t('stats.date_range') }}:</div>
              <div class="w-64">
                <va-date-input v-model="dateRange" mode="range" @update:modelValue="updateDateRange" />
              </div>
            </div>
            <div>
              <div class="mb-2">{{ $t('stats.badges') }}:</div>
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
                    <td>{{ $t('stats.first_date') }}</td>
                    <td>{{ dateFormat(stats_logs.first_date) }}</td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.last_date') }}</td>
                    <td>{{ dateFormat(stats_logs.last_date) }}</td>
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
              <div>
                <EchartsDonught v-if="pieChartUnderway.length" :series="pieChartUnderway" :theme="currentTheme" />
              </div>
            </template>
          </va-inner-loading>
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 sm:col-span-12 p-2">
        <va-card-title>{{ t('stats.moorages') }}</va-card-title>
        <va-card-content>
          <va-inner-loading :loading="isBusy">
            <template v-if="stats_moorages?.unique_moorages">
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
                        {{ durationI18nDaysHours(stats_moorages.time_at_home_ports) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('stats.time_spent_away') }}</td>
                    <td>
                      <router-link class="va-link link" :to="{ name: 'stays' }">
                        {{ durationI18nDaysHours(stats_moorages.time_spent_away) }}
                      </router-link>
                    </td>
                  </tr>
                  <tr v-for="(value, stayCode) in timeSpentAwayByType" :key="stayCode">
                    <template v-if="value.durationMs > 0">
                      <td class="sub-setting">{{ $t('id.stay_code.' + stayCode) }}</td>
                      <td class="flex">
                        <router-link class="va-link link" :to="{ name: 'stays' }">
                          {{ durationI18nDaysHours(value.duration) }}
                        </router-link>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
              <div>
                <EchartsDonught v-if="pieChartStayType.length" :series="pieChartStayType" :theme="currentTheme" />
              </div>
            </template>
          </va-inner-loading>
        </va-card-content>
      </va-card>

      <top-by
        v-if="logsTopByDistance.length > 0"
        :items="logsTopByDistance"
        :title="t('stats.top_logs_by_distance')"
        columnvalue="distance"
      />
      <top-by
        v-if="logsTopByDuration.length > 0"
        :items="logsTopByDuration"
        :title="t('stats.top_logs_by_duration')"
        columnvalue="duration"
      />
      <top-by
        v-if="logsTopByAvgSpeed.length > 0"
        :items="logsTopByAvgSpeed"
        :title="t('stats.top_logs_by_avg_speed')"
        columnvalue="avg_speed"
      />
      <top-by
        v-if="logsTopByMaxSpeed.length > 0"
        :items="logsTopByMaxSpeed"
        :title="t('stats.top_logs_by_max_speed')"
        columnvalue="max_speed"
      />
      <top-by
        v-if="logsTopByWindSpeed.length > 0"
        :items="logsTopByWindSpeed"
        :title="t('stats.top_logs_by_wind_speed')"
        columnvalue="wind_speed"
      />
      <top-moorages-by
        v-if="mooragesTopByDuration.length > 0"
        :items="mooragesTopByDuration"
        :title="t('stats.top_moorages_by_duration')"
        columnvalue="duration"
      />
      <top-moorages-by
        v-if="mooragesTopByArrivals.length > 0"
        :items="mooragesTopByArrivals"
        :title="t('stats.top_moorages_by_arrivals')"
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
  const nodatayet = defineAsyncComponent(() => import('../../components/noDataScreen.vue'))
  import EchartsDonught from '../../components/echarts/donught.vue'
  import { useGlobalStore } from '../../stores/global-store'
  import { storeToRefs } from 'pinia'
  import moment from 'moment/min/moment-with-locales'
  const IconAward = defineAsyncComponent(() => import('../../components/icons/IconAward.vue'))
  const IconNavigation = defineAsyncComponent(() => import('../../components/icons/IconNavigation.vue'))
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { durationI18nDaysHours, dateFormat } from '../../utils/dateFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  const { publicVessel, instagram, website } = useGlobalStore()
  import TopBy from './Cards/TopBy.vue'
  import TopMooragesBy from './Cards/TopMooragesBy.vue'

  const { t } = useI18n()
  const GlobalStore = useGlobalStore()
  const {
    userBadges,
    currentTheme,
    vessel_stats,
    stats_logs,
    stats_moorages,
    pieChartUnderway,
    pieChartStayType,
    timeSpentAwayByType,
  } = storeToRefs(GlobalStore)

  const isBusy = ref(false)
  const apiError = ref(null)
  const dateRange = ref(null)

  function getFlagIcon(code, size) {
    return `flag-icon-${code} ${size}`
  }

  const disabled = computed(() => !isBusy.value && !stats_logs.value?.count)

  const logsTopByAvgSpeed = computed(() =>
    (vessel_stats.value.logs_top_avg_speed ?? []).map((e) => ({ ...e, avg_speed: speedFormatKnots(e.avg_speed) })),
  )
  const logsTopByMaxSpeed = computed(() =>
    (vessel_stats.value.logs_top_speed ?? []).map((e) => ({ ...e, max_speed: speedFormatKnots(e.max_speed) })),
  )
  const logsTopByWindSpeed = computed(() =>
    (vessel_stats.value.logs_top_wind_speed ?? []).map((e) => ({
      ...e,
      wind_speed: speedFormatKnots(e.max_wind_speed),
    })),
  )
  const logsTopByDistance = computed(() =>
    (vessel_stats.value.logs_top_distance ?? []).map((e) => ({ ...e, distance: distanceFormatMiles(e.distance) })),
  )
  const logsTopByDuration = computed(() =>
    (vessel_stats.value.logs_top_duration ?? []).map((e) => ({ ...e, duration: durationI18nDaysHours(e.duration) })),
  )
  const mooragesTopByDuration = computed(() =>
    (vessel_stats.value.moorages_top_duration ?? []).map((e) => ({ ...e, duration: durationI18nDaysHours(e.dur) })),
  )
  const mooragesTopByArrivals = computed(() =>
    (vessel_stats.value.moorages_top_arrivals ?? []).map((e) => ({ ...e, arrivals: e.ref_count })),
  )

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    try {
      await GlobalStore.fetchStats()
      dateRange.value = { start: stats_logs.value?.first_date || null, end: stats_logs.value?.last_date || null }
    } catch (e) {
      apiError.value = e
    } finally {
      isBusy.value = false
    }
  })

  function updateDateRange() {
    updateStatsLogs()
  }

  async function updateStatsLogs() {
    try {
      await GlobalStore.fetchStats({
        start_date: moment(dateRange.value.start).format('YYYY-MM-DD'),
        end_date: moment(dateRange.value.end).format('YYYY-MM-DD'),
      })
    } catch (err) {
      console.error('updateStatsLogs failed', err)
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
