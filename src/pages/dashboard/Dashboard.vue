<template>
  <div class="dashboard flex flex-wrap p-2 gap-4">
    <va-card v-if="monitoring && status" class="flex card-width">
      <va-card-content>
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
              <td>{{ status.monitoring }}</td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <template v-if="monitoring.geojson">
      <va-card v-if="currentWeather.temp" class="flex card-width">
        <va-card-content class="grid grid-cols-12">
          <div class="col-span-6 flex flex-col va-text-center">
            <p style="font-size: 3rem; line-height: 54px">
              {{ currentWeather.temp }}
              <span style="font-size: 1rem; line-height: 32px; vertical-align: super; opacity: 0.8; top: 15px">°C</span>
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
                <img class="" :src="currentWeather.img" :width="96" :height="96" />
                <div>{{ currentWeather.description }}</div>
              </div>
              <div>
                <img class="" :src="Lunar.src" :width="96" :height="96" style="padding: 20%" />
                <div>{{ Lunar.text }}</div>
              </div>
            </div>
          </div>
        </va-card-content>
      </va-card>
      <va-card v-if="monitoring.geojson && mapGeoJsonFeatures" class="flex card-width">
        <va-card-content style="width: 100%">
          <template v-if="monitoring.geojson && mapGeoJsonFeatures">
            <l-map id="dashboard-map" :geo-json-feature="mapGeoJsonFeatures" :control-layer="false" :map-zoom="10" />
          </template>
        </va-card-content>
      </va-card>
    </template>
  </div>
  <div class="dashboard grid grid-cols-12 items-start p-2 gap-4">
    <template v-if="Monitoring2">
      <va-card v-if="Monitoring2" class="col-span-12">
        <va-card-content class="grid grid-cols-12 row row-separated">
          <div v-if="stateOfCharge" class="col-span-3 flex flex-col">
            <va-icon name="icon-battery" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ stateOfCharge.value }}%</h3>
            <p class="va-text-center">{{ t('dashboard.panel.battery') }}</p>
          </div>
          <div v-if="panelPower" class="col-span-3 flex flex-col">
            <va-icon name="icon-solar" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ panelPower.value }}W</h3>
            <p class="va-text-center no-wrap">{{ t('dashboard.panel.solar') }}</p>
          </div>
          <div v-if="Power" class="col-span-3 flex flex-col">
            <va-icon name="icon-bolt" :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ Power.value }}W</h3>
            <p class="va-text-center">{{ t('dashboard.panel.power') }}</p>
          </div>
          <div v-if="tanksCapacity" class="col-span-3 flex flex-col">
            <va-icon name="icon-tank" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ tanksCapacity.value }}%</h3>
            <p class="va-text-center">{{ t('dashboard.panel.tank') }}</p>
          </div>
        </va-card-content>
      </va-card>
    </template>

    <!--
    <va-card class="col-span-12 sm:col-span-6">
      <va-card-content class="grid grid-cols-12 row-separated">
        <div v-if="stateOfCharge" class="col-span-4 p-4 flex flex-col row">
          <va-icon name="icon-battery" outline :size="96"></va-icon>
          <h3 class="va-h3 m-0 va-text-center">{{ stateOfCharge.value }}%</h3>
          <p class="va-text-center">{{ stateOfCharge.key }}</p>
        </div>
        <div v-if="panelPower" class="col-span-4 p-4 flex flex-col row">
          <va-icon name="icon-solar" outline :size="96"></va-icon>
          <h3 class="va-h3 m-0 va-text-center">{{ panelPower.value }} W</h3>
          <p class="va-text-center no-wrap">{{ panelPower.key }}</p>
        </div>
        <div v-if="Power" class="col-span-4 p-4 flex flex-col row">
          <va-icon name="bolt" outline :size="96"></va-icon>
          <h3 class="va-h3 m-0 va-text-center">{{ Power.value }}W</h3>
          <p class="va-text-center">{{ Power.key }}</p>
        </div>
      </va-card-content>
    </va-card>

    <va-card v-if="monitoring" class="col-span-12 sm:col-span-6">
      <va-card-content class="grid grid-cols-12 row-separated">
        <div class="col-span-4 p-4 flex flex-col">
          <h2>Local Time</h2>
          <p>10:47</p>
          <h2>Status</h2>
          <p>OK?</p>
          <h2>Last updated</h2>
          <p>OK?</p>
        </div>
        <div v-if="currentweather && iconurl" class="col-span-4 p-4 flex flex-col">
          <img :src="iconurl" :width="96" :height="96" />
          <h3 class="va-h3 m-0 va-text-center">{{ currentweather.temp }}C</h3>
          <p class="va-text-center">{{ currentweather.description }}</p>
        </div>
        <div v-if="mapGeoJsonFeatures" class="col-span-4 p-4 flex flex-col">
          <lMap :geo-json-feature="mapGeoJsonFeatures" style="width: 100%; height: 120px" />
        </div>
      </va-card-content>
    </va-card>
-->

    <va-card v-for="(info, idx) in infoTiles" :key="idx" :color="info.color" class="col-span-4">
      <router-link :to="info.text">
        <va-card-content>
          <h2 class="va-h2 m-0 text-white">{{ info.value }}</h2>
          <p class="text-white">{{ t('menu.' + info.text) }}</p>
        </va-card-content>
      </router-link>
    </va-card>
    <!--
    <charts class="col-span-12" />
-->
    <echarts class="col-span-12" />

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

    <va-card class="col-span-12">
      <va-card-title>{{ t('dashboard.versions') }}</va-card-title>
      <va-card-content>
        Frontend version: {{ versions.web_version }}, VueJS: {{ version }}, Vite: {{ vite_version }}<br />
        Backend version: {{ versions.api_version }}, {{ versions.sys_version }}, TimescaleDB:
        {{ versions.timescaledb }}, PostGIS: {{ versions.postgis }}, {{ versions.postgrest }}<br />
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
  //const Charts = defineAsyncComponent(() => import('./Charts.vue'))
  const Echarts = defineAsyncComponent(() => import('./Echarts.vue'))
  const lMap = defineAsyncComponent(() => import('../../components/maps/leafletMap.vue'))
  import PostgSail from '../../services/api-client'
  import { fromNow, localTime } from '../../utils/dateFormatter.js'
  import { Moon } from 'lunarphase-js'
  const moon_phases = [
    'New',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ]
  const { t } = useI18n()

  const GlobalStore = useGlobalStore()
  const { userName, versions, currentWeather, Monitoring2 } = storeToRefs(GlobalStore)
  const { fetchVersions, fetchWeatherForecast, fetchMonitoring2 } = GlobalStore

  const CacheStore = useCacheStore()
  const { getInfoTiles, GetLastLogId } = storeToRefs(CacheStore)
  const { getTags, getAPI, InfoTiles, barChart, lineChartbyYear, matrixChartbyMonthDay } = CacheStore

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
    {
      color: 'info',
      value: '0',
      text: 'logs',
      icon: 'menu-logs',
    },
    {
      color: 'info',
      value: '0',
      text: 'stays',
      icon: 'menu-stays',
    },
    {
      color: 'info',
      value: '0',
      text: 'moorages',
      icon: 'menu-moorages',
    },
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
    obj.monitoring = monitoring.value.time && !monitoring.value.offline ? 'Online' : 'Offline'
    return obj
  })

  let re = new RegExp(/electrical\.batteries.*\.stateOfCharge/, 'i')
  const stateOfCharge = computed(() => {
    if (!Array.isArray(Monitoring2.value)) return Array.isArray(Monitoring2.value)
    let obj = { key: 'stateOfCharge', value: 0 }
    console.log('stateOfCharge')
    re = new RegExp(/electrical\.batteries.*\.stateOfCharge/, 'i')
    Monitoring2.value.forEach(({ key, value }) => {
      //console.log(re.test(key))
      if (re.test(key)) {
        console.log(key, value)
        obj.key = key.split('.').slice(1).join('.')
        obj.value = Math.round(value * 100)
      }
    })
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
  const tanksCapacity = computed(() => {
    if (!Array.isArray(Monitoring2.value)) return Array.isArray(Monitoring2.value)
    let obj = { key: 'tankscurrentLevel', value: 0 }
    console.log('tankscurrentLevel')
    re = new RegExp(/tanks\..*\.currentLevel.*/, 'i')
    Monitoring2.value.forEach(({ key, value }) => {
      //console.log(re.test(key))
      if (re.test(key)) {
        console.log(key, value)
        obj.key = key.split('.').slice(1).join('.')
        obj.value = Math.round(value * 100)
      }
    })
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
    if (!Array.isArray(moon_phases)) return { src: '', text: '' }
    const text = Moon.lunarPhase()
    const isPhase = (element) => element === text
    const index = moon_phases.findIndex(isPhase)
    //console.log(`/moon_phase_${index}.svg`)
    return { src: `/moon_phase_${index}.svg`, text: text.toLowerCase() }
  })

  const LogsImage = computed(() => {
    //console.log(GetLastLogId.value)
    //console.log(vesselId.value)
    if (GetLastLogId.value > 1 && vesselId.value) {
      return `https://gis.openplotter.cloud/logs_${vesselId.value}_${GetLastLogId.value}.png`
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
    if (!(mylogs && mylogs[0] && mystays && mystays[0] && mymoorages && mymoorages[0])) {
      console.warn('no metrics, new vessel?')
    }
    /*
    if (mylogs && mylogs[0] && mystays && mystays[0] && mymoorages && mymoorages[0]) {
      // for manual expanding in console:
      console.log('Dashboard onMounted my(logs|stays|moorages)', [
        [mylogs, mystays, mymoorages],
        {
          'mylogs[0].Distance': mylogs[0].Distance,
          'mystays[0].duration': mystays[0].duration,
          'mymoorages[0].total_stay': mymoorages[0].total_stay,
        },
      ])
    }
    */
    // Load Charts Dashboard
    getTags()
    InfoTiles()
    barChart()
    lineChartbyYear()
    matrixChartbyMonthDay()
    console.log('Dashboard onMounted getInfoTiles.value', getInfoTiles.value)
    for (let tile in CacheStore.tiles) {
      //infoTiles.value[tile as unknown as number].value = CacheStore.tiles[tile as unknown as number]
      infoTiles.value[tile].value = CacheStore.tiles[tile]
    }
    console.debug('Dashboard onMounted CacheStore', CacheStore)

    const api = new PostgSail()
    try {
      let response = await api.monitoring()
      if (response && response[0]) {
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

    // WeatherForecast
    try {
      // Duplicate json ref to keep origin geojson valid
      const geojson = monitoring.value.geojson.geometry.coordinates.map((x) => x)
      await fetchWeatherForecast(geojson.reverse())
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
    .card-width {
      width: 100%;
      @media (min-width: 768px) {
        width: calc((100% - 2rem) / 2);
      }
      @media (min-width: 1024px) {
        width: calc((100% - 2rem) / 3);
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

  .rich-theme-card-text {
    line-height: 1.5;
  }

  .gallery-carousel {
    width: 80vw;
    max-width: 100%;

    @media all and (max-width: 576px) {
      width: 100%;
    }
  }
</style>
