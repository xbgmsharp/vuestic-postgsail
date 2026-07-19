<template>
  <div class="dashboard grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start p-2 gap-4">
    <va-card v-if="monitoring && status">
      <va-card-content class="grid grid-cols-12">
        <div class="col-span-6 flex flex-col va-text-center">
          <table class="va-table va-table--hoverable va-text-center">
            <tbody>
              <tr>
                <td>{{ t('dashboard.local_time') }}</td>
                <td>{{ status.local_time }}</td>
              </tr>
              <tr>
                <td>{{ t('boats.boat.last_contact') }}</td>
                <td>{{ status.last_updated }}</td>
              </tr>
              <tr>
                <td>{{ t('monitoring.title') }}</td>
                <td>
                  {{ status.monitoring }}
                  <span class="relative inline-block size-3">
                    <span
                      :class="['absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', healthClass]"
                    ></span>
                    <span :class="['relative inline-flex size-3 rounded-full', healthClass]"></span
                  ></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="statusText.img" class="col-span-6 flex flex-col va-text-center">
          <div class="grid gap-4 va-text-center">
            <div>
              <img :src="statusText.img" :width="84" :height="84" alt="status icon" style="margin-left: 30%" />
              {{ statusText.text }}
            </div>
          </div>
        </div>
      </va-card-content>
    </va-card>
    <template v-if="monitoring.geojson">
      <va-card v-if="currentWeather.temp">
        <va-card-content class="grid grid-cols-12">
          <div class="col-span-6 flex flex-col va-text-center">
            <p style="font-size: 3rem; line-height: 54px">
              {{ currentWeather.temp }}
              <span
                style="
                  font-size: 1rem;
                  line-height: 32px;
                  vertical-align: super;
                  opacity: 0.8;
                  top: 15px;
                  font-weight: bold;
                "
                >°{{ currentWeather.tempUnit }}</span
              >
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <va-icon style="display: inline-block" name="icon-sunrise" outline :size="48"></va-icon>
                <div>{{ currentWeather.sunriseTime }}</div>
              </div>
              <div>
                <va-icon style="display: inline-block" name="icon-sunset" outline :size="48"></va-icon>
                <div>{{ currentWeather.sunsetTime }}</div>
              </div>
            </div>
          </div>
          <div class="col-span-6 flex flex-col va-text-center">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <img class="" :src="weatherObj.img" :width="96" :height="96" />
                <div>{{ weatherObj.description }}</div>
              </div>
              <div>
                <img class="" :src="Lunar.src" :width="96" :height="96" style="padding: 20%" />
                <div>{{ Lunar.text }}</div>
              </div>
            </div>
          </div>
        </va-card-content>
      </va-card>
      <va-card v-if="monitoring.geojson" class="h-full">
        <va-card-content style="width: 100%; height: 100%">
          <l-map id="dashboard-map" :geo-json-feature="mapGeoJsonFeatures" :control-layer="false" :map-zoom="10" />
        </va-card-content>
      </va-card>
    </template>
  </div>

  <div class="dashboard grid grid-cols-12 items-start p-2 gap-4">
    <template v-if="Monitoring2">
      <va-card v-if="Monitoring2" class="col-span-12">
        <va-card-content class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div v-if="stateOfCharge" class="flex flex-col items-center gap-1 py-2">
            <va-icon name="icon-battery" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ stateOfCharge.value }}%</h3>
            <p class="va-text-center">{{ t('dashboard.panel.battery') }}</p>
          </div>
          <div v-if="panelPower" class="flex flex-col items-center gap-1 py-2">
            <va-icon name="icon-solar" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ panelPower.value }}W</h3>
            <p class="va-text-center no-wrap">{{ t('dashboard.panel.solar') }}</p>
          </div>
          <div v-if="Power" class="flex flex-col items-center gap-1 py-2">
            <va-icon name="icon-bolt" :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ Power.value }}W</h3>
            <p class="va-text-center">{{ t('dashboard.panel.power') }}</p>
          </div>
          <div v-if="tanksCapacity" class="flex flex-col items-center gap-1 py-2">
            <va-icon name="icon-tank" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ tanksCapacity.value }}%</h3>
            <p class="va-text-center">{{ t('dashboard.panel.tank') }}</p>
          </div>
          <div v-if="engineRuntime" class="flex flex-col items-center gap-1 py-2">
            <va-icon name="engine" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ engineRuntime.value }}h</h3>
            <p class="va-text-center">{{ t('dashboard.panel.engine') }}</p>
          </div>
        </va-card-content>
      </va-card>
    </template>

    <!-- Info Tiles — powered by vessel_activity_fn() -->
    <va-card v-for="(info, idx) in infoTiles" :key="idx" :color="info.color" class="col-span-4">
      <router-link :to="info.route">
        <va-card-content class="flex flex-col space-y-3">
          <header class="flex items-center justify-between">
            <h2 class="va-h2 m-0 text-white">{{ info.total }}</h2>
            <div class="p-1.5 rounded flex items-center justify-center">
              <va-icon :name="info.icon" outline :size="48" class="text-white" />
            </div>
          </header>

          <!-- Total count + label -->
          <div>
            <!-- <h2 class="va-h2 m-0 text-white">{{ info.total }}</h2> -->
            <p class="text-white opacity-80 text-sm">{{ t('menu.' + info.text) }}</p>
          </div>

          <!-- 30-day delta -->
          <section class="border-t border-white/20 pt-2">
            <div class="text-white font-semibold text-base">{{ info.last30d }} {{ t('dashboard.tiles.last_30d') }}</div>

            <!-- pct is NULL when prev_30d = 0 (first activity or off-season) -->
            <p v-if="info.pct !== null" class="text-sm flex items-center gap-1 mt-0.5">
              <va-icon
                :name="info.pct >= 0 ? 'arrow_upward' : 'arrow_downward'"
                size="16px"
                :class="info.pct >= 0 ? 'text-green-300' : 'text-red-300'"
              />
              <span :class="info.pct >= 0 ? 'text-green-300' : 'text-red-300'">
                {{ Math.abs(info.pct).toFixed(1) }}%
              </span>
              <span class="text-white/60">{{ t('dashboard.tiles.vs_prev_30d') }}</span>
            </p>

            <p v-else-if="info.delta !== null" class="text-sm flex items-center gap-1 mt-0.5">
              <va-icon
                :name="info.delta >= 0 ? 'arrow_upward' : 'arrow_downward'"
                size="16px"
                :class="info.delta >= 0 ? 'text-green-300' : 'text-red-300'"
              />
              <span :class="info.delta >= 0 ? 'text-green-300' : 'text-red-300'">
                {{ info.delta >= 0 ? '+' : '' }}{{ info.delta }}
              </span>
              <span class="text-white/60">{{ t('dashboard.tiles.vs_prev_30d') }}</span>
            </p>

            <p v-else class="text-sm text-white/50 mt-0.5">
              {{ t('dashboard.tiles.no_prev_data') }}
            </p>
          </section>
        </va-card-content>
      </router-link>
    </va-card>

    <!-- echarts -->
    <echarts class="col-span-12" />

    <!-- Overview -->
    <va-card class="col-span-12">
      <va-card-title>{{ t('dashboard.overview') }}</va-card-title>
      <template v-if="LogsImage">
        <va-card-content v-if="LogsImage">
          <img style="margin: auto" :src="LogsImage" />
        </va-card-content>
      </template>
      <template v-else>
        <va-card-content>{{ t('nodata.nodata') }}</va-card-content>
      </template>
    </va-card>

    <!-- Versions -->
    <va-card class="col-span-12">
      <va-card-title>{{ t('dashboard.versions') }}</va-card-title>
      <va-card-content>
        Frontend version: {{ versions.web_version }}, VueJS: {{ version }}, Vite: {{ vite_version }}<br />
        Backend version: {{ versions.api_version }}, {{ versions.sys_version }}, TimescaleDB:
        {{ versions.timescaledb }}, PostGIS: {{ versions.postgis }}, {{ versions.postgrest }}, MobilityDB:
        {{ versions.mobilitydb }}<br />
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  // TODO  lang="ts"
  import { ref, onMounted, version, computed, defineAsyncComponent } from 'vue'
  import { useGlobalStore } from '../../stores/global-store'
  import { useCacheStore } from '../../stores/cache-store'
  import { useVesselStore } from '../../stores/vessel-store'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  const Echarts = defineAsyncComponent(() => import('./Echarts.vue'))
  const lMap = defineAsyncComponent(() => import('../../components/maps/leafletMap.vue'))
  import PostgSail from '../../services/api-client'
  import { fromNow, localTime } from '../../utils/dateFormatter.js'
  import { Moon } from 'lunarphase-js'
  import { moonPhases, getWMOData } from '../../utils/PostgSail'

  const { t } = useI18n()

  const GlobalStore = useGlobalStore()
  const { userName, versions, currentWeather, Monitoring2, MonitoringLive, hasLogs } = storeToRefs(GlobalStore)
  const { fetchVersions, fetchWeatherForecast, fetchMonitoring2, fetchMonitoringLive, fetchStats } = GlobalStore

  const CacheStore = useCacheStore()
  const { getActivity, GetLastLogId } = storeToRefs(CacheStore)
  const { getTags, Activity, lineChartbyMonth, lineChartbyWeek, logsChartHeatmap, logsChartNetwork, getAPI } =
    CacheStore

  const VesselStore = useVesselStore()
  const { vesselId } = storeToRefs(VesselStore)

  console.log('Dashboard', __APP_VERSION__, __VITE_VERSION__, import.meta.env)
  const vite_version = ref(__VITE_VERSION__)
  let app_version = ref('')
  // only VITE_* are exposed
  app_version.value = __APP_VERSION__ + '-' + import.meta.env.VITE_GIT_VERSION
  if (import.meta.env.DEV) {
    app_version.value += '-' + 'dev'
  } else {
    app_version.value += '-' + 'prod'
  }
  console.log('app_version:', app_version.value, userName.value)

  const infoTiles = ref([
    { color: 'info', route: '/logs', text: 'logs', icon: 'map', total: 0, last30d: 0, pct: null },
    { color: 'info', route: '/stays', text: 'stays', icon: 'houseboat', total: 0, last30d: 0, pct: null },
    { color: 'info', route: '/moorages', text: 'moorages', icon: 'anchor', total: 0, last30d: 0, pct: null },
  ])

  const monitoring = ref({})

  const mapGeoJsonFeatures = computed(() => {
    console.log('mapGeoJsonFeatures', monitoring.value.geojson)
    return monitoring.value ? monitoring.value.geojson : {}
  })

  const status = computed(() => {
    let obj = { fromNow: null, last_updated: null, monitoring: null }
    console.log('fromNow', monitoring.value)
    obj.local_time = localTime()
    obj.last_updated = monitoring.value.time ? fromNow(monitoring.value.time) : 'Pending'
    obj.monitoring = !monitoring.value.time
      ? 'Pending'
      : monitoring.value.time && !monitoring.value.offline
      ? 'Online'
      : 'Offline'
    obj.health = monitoring.value.time && !monitoring.value.offline ? 0 : 1
    return obj
  })

  let re = new RegExp(/electrical\.batteries.*\.stateOfCharge/, 'i')
  const stateOfCharge = computed(() => {
    let obj = { key: 'stateOfCharge', value: 0 }
    if (!MonitoringLive.value?.data?.battery?.charge) return obj
    console.debug('stateOfCharge', MonitoringLive.value)
    obj.value = Math.round(MonitoringLive.value.data.battery.charge * 100)
    return obj
  })
  const panelPower = computed(() => {
    if (!Array.isArray(Monitoring2.value)) return Array.isArray(Monitoring2.value)
    let obj = { key: 'panelPower', value: 0 }
    console.log('panelPower')
    re = new RegExp(/electrical\.solar.*\.panelPower/, 'i')
    Monitoring2.value.forEach(({ key, value }) => {
      //console.log(re.test(key))
      if (re.test(key)) {
        console.log(key, value)
        obj.key = key.split('.').slice(1).join('.')
        obj.value += value
      }
    })
    obj.value = Math.round(obj.value)
    return obj
  })
  const engineRuntime = computed(() => {
    let obj = { key: 'engineRuntime', value: 0 }
    //Total running time for engine (Engine Hours in seconds)
    re = new RegExp(/propulsion.*\.runTime/, 'i')
    Monitoring2.value.forEach(({ key, value }) => {
      //console.log(re.test(key))
      if (re.test(key)) {
        console.log(key, value)
        obj.key = key.split('.').slice(1).join('.')
        obj.value += value
      }
    })
    obj.value = Math.round(obj.value / 3600) // Transform in hours
    return obj
  })
  const tanksCapacity = computed(() => {
    let obj = { key: 'tanksCapacity', value: 0 }
    if (!MonitoringLive.value?.data?.tank?.level) return obj
    console.debug('tanksCapacity', MonitoringLive.value)
    obj.value = Math.round(MonitoringLive.value.data.tank.level * 100)
    return obj
  })
  const Power = computed(() => {
    if (!Array.isArray(Monitoring2.value)) return Array.isArray(Monitoring2.value)
    let obj = { key: 'Power', value: 0 }
    console.log('Power')
    re = new RegExp(/electrical\.batteries\..*\.current/, 'i')
    Monitoring2.value.some(function (el) {
      //console.log(re.test(key))
      if (re.test(el.key)) {
        console.log(el.key, el.value)
        obj.key = el.key.split('.').slice(1).join('.')
        obj.value = el.value
        return true
      }
    })
    re = new RegExp(/electrical\.batteries\..*\.voltage/, 'i')
    Monitoring2.value.some(function (el) {
      //console.log(re.test(key))
      if (re.test(el.key)) {
        console.log(el.key, el.value)
        obj.key = el.key.split('.').slice(1, -1).join('.')
        obj.value = Math.round(el.value * obj.value) // Transform in Watt
        return true
      }
    })
    return obj
  })

  const Lunar = computed(() => {
    if (!Array.isArray(moonPhases)) return { src: '', text: '' }
    const text = Moon.lunarPhase()
    const isPhase = (element) => element === text
    const index = moonPhases.findIndex(isPhase)
    //console.log(`/moon_phase_${index}.svg`)
    return { src: `/moon_phase_${index}.svg`, text: t('weather.moon.' + text.toLowerCase().replace(/\s+/g, '_')) }
  })

  const LogsImage = computed(() => {
    //console.log(GetLastLogId.value)
    //console.log(vesselId.value)
    if (GetLastLogId.value > 1 && vesselId.value && import.meta.env.VITE_QGIS_URL) {
      return import.meta.env.VITE_QGIS_URL + `/logs_${vesselId.value}_${GetLastLogId.value}.png`
    }
    return null
  })

  onMounted(async () => {
    // Load version
    await fetchVersions(app_version.value)
    // Load cache
    const mylogs = await getAPI('logs')
    const mystays = await getAPI('stays')
    const mymoorages = await getAPI('moorages')
    const isEmpty = (arr) => !Array.isArray(arr) || arr.length === 0
    if (isEmpty(mylogs) && isEmpty(mystays) && isEmpty(mymoorages)) {
      console.warn('Warning, no metrics, new vessel?')
    }
    // Do we have inconsistent data from cache?
    const sources = [mylogs, mystays, mymoorages]
    // Count how many arrays are non-empty
    const nonEmptyCount = sources.filter((arr) => Array.isArray(arr) && arr.length > 0).length
    // If some have data and others don't, that's inconsistent
    if (nonEmptyCount > 0 && nonEmptyCount < sources.length) {
      console.warn('Warning, inconsistent cache data detected. Resetting cache.')
      await CacheStore.resetCache()
    }
    // Check if the CacheStore cache is consistent with the actual data
    if (
      CacheStore.logs.length != mylogs.length ||
      CacheStore.stays.length != mystays.length ||
      CacheStore.moorages.length != mymoorages.length
    ) {
      console.warn('Warning, inconsistent cache data detected. Resetting cache.')
      await CacheStore.resetCache()
    }

    // Load Charts Dashboard
    await getTags()
    await Activity()
    await lineChartbyMonth()
    await lineChartbyWeek()
    await logsChartHeatmap()
    await logsChartNetwork()
    console.log('Dashboard onMounted getActivity.value', getActivity.value)
    infoTiles.value = [
      { color: 'info', route: '/logs', text: 'logs', icon: 'map', ...CacheStore.getActivity.logs },
      { color: 'info', route: '/stays', text: 'stays', icon: 'houseboat', ...CacheStore.getActivity.stays },
      { color: 'info', route: '/moorages', text: 'moorages', icon: 'anchor', ...CacheStore.getActivity.moorages },
    ]
    console.debug('Dashboard onMounted CacheStore, found logs', CacheStore.logs.length, mylogs.length)

    const api = new PostgSail()
    try {
      let response = await api.monitoring()
      if (response && Array.isArray(response) && response[0]) {
        monitoring.value = response[0]
        console.log('monitoring success', response)
      } else {
        throw { response }
      }
    } catch (err) {
      // If exit as we need coordinates
      console.log('monitoring failed', err)
      return
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }

    // WeatherForecast - OpenMeteo
    try {
      // Duplicate json ref to keep origin geojson valid
      const geojson = monitoring.value.geojson.geometry.coordinates.map((x) => x)
      await fetchWeatherForecast([...geojson].reverse())
      console.log('Dashboard onMounted currentWeather.value', currentWeather.value)
    } catch (err) {
      console.log('fetchWeatherForecast failed', err)
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }

    // Energy Monitoring2
    try {
      await fetchMonitoring2()
      console.log('Dashboard onMounted Monitoring2.value', Monitoring2.value)
    } catch (err) {
      console.log('fetchMonitoring2 failed', err)
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }

    // Energy MonitoringLive
    try {
      await fetchMonitoringLive()
      console.log('Dashboard onMounted MonitoringLive.value', MonitoringLive.value)
    } catch (err) {
      console.log('fetchMonitoringLive failed', err)
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }

    // Fetch Stats
    try {
      await fetchStats()
      //console.log('Dashboard onMounted stats', stats_logs.value)
      //console.log('Dashboard onMounted stats', stats_moorages.value)
    } catch (err) {
      console.log('stats failed', err)
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }
    console.debug('Dashboard onMounted CacheStore logs', CacheStore.logs.length, mylogs.length, hasLogs.value)

    // Check for cache consistency against stats
    if (hasLogs.value != mylogs.length || hasLogs.value != CacheStore.logs.length) {
      console.warn('Warning, inconsistent cache data detected. Resetting cache.')
      await CacheStore.resetCache()
    }
  })

  const healthClass = computed(() => {
    return {
      'bg-green-500': status.value.health == 0,
      'bg-yellow-500': status.value.health == 1,
      'bg-red-500': status.value.health == 2,
    }
  })

  const statusText = computed(() => {
    const props = monitoring.value?.live?.properties || null
    let status = monitoring.value?.status || null
    let img = null

    if (status === 'moored') {
      if (props?.stay_code === 1) {
        // Unknown stay type
        status = monitoring.value.status
      } else if (props?.stay_code === 2) {
        status = t('dashboard.status.moored_at_anchor', 'moored at anchor in')
        img = '/anchoricon.png'
      } else if (props?.stay_code === 3) {
        status = t('dashboard.status.moored_at_buoy', 'moored at mooring buoy in')
        img = '/mooring_icon.png'
      } else if (props?.stay_code === 4) {
        status = t('dashboard.status.moored_at_dock', 'moored at dock in')
        img = '/dock_icon.png'
      }
      return {
        text: `${status} ${props?.name || ''}`,
        img: img,
      }
    } else if (status !== 'moored' && status !== null) {
      const underwayText = t('dashboard.status.underway', 'underway')
      return {
        text: `${status} ${underwayText}`,
        img: '/apple-touch-icon.png',
      }
    } else {
      return {
        text: t('dashboard.status.no_status_detected', 'No status detected'),
        img: '/apple-touch-icon.png',
      }
    }
  })

  const weatherObj = computed(() => {
    //console.log(currentWeather.value)
    const wmoData = getWMOData()
    const statusText = wmoData[currentWeather.value.weather_code]
    //console.log(statusText['day'])
    return {
      description: statusText['day'].description,
      img: statusText['day'].image,
    }
  })
</script>

<style lang="scss">
  #dashboard-map {
    width: 100%;

    @media (max-width: 576px) {
      height: 126px;
    }

    @media (min-width: 1024px) {
      height: 100%;
    }
  }

  .dashboard {
    .va-icon {
      fill: var(--va-text-primary);
    }

    .va-card {
      margin-bottom: 0 !important;

      &__title {
        display: flex;
        justify-content: space-between;
      }
    }

    td:nth-child(1) {
      text-align: right;
      padding-right: 5px;
    }

    td:nth-child(2) {
      font-weight: bold;
    }
  }

  .row-separated {
    .flex + .flex {
      border-left: 1px solid var(--va-background-primary);
    }
  }
</style>
