<template>
  <div class="dashboard grid grid-cols-12 items-start gap-6">
    <va-card v-if="monitoring && status" class="col-span-12 md:col-span-4 p4">
      <va-card-content>
        <table class="va-table va-table--hoverable va-text-center">
          <tbody>
            <tr>
              <td>
                <b>{{ t('dashboard.local_time') }}:</b>
              </td>
              <td>{{ status.fromNow }}</td>
            </tr>
            <tr>
              <td>
                <b>{{ t('boats.boat.last_contact') }}:</b>
              </td>
              <td>{{ status.last_updated }}</td>
            </tr>
            <tr>
              <td>
                <b>{{ t('monitoring.title') }}:</b>
              </td>
              <td>{{ status.monitoring }}</td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <template v-if="monitoring.geojson">
      <va-card v-if="currentWeather.temp" class="col-span-12 md:col-span-4">
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
          <div class="col-span-6 flex flex-col va-text-center align-center">
            <img class="" :src="currentWeather.img" :width="96" :height="96" />
            <p class="va-text-center">{{ currentWeather.description }}</p>
          </div>
        </va-card-content>
      </va-card>
      <va-card v-if="monitoring.geojson" class="col-span-12 md:col-span-4">
        <va-card-content>
          <lMap
            :geo-json-feature="mapGeoJsonFeatures"
            :control-layer="false"
            :zoom="10"
            style="width: 100%; height: 120px"
          />
        </va-card-content>
      </va-card>
    </template>

    <template v-if="Monitoring2">
      <va-card v-if="Monitoring2" class="col-span-12">
        <va-card-content class="grid grid-cols-12 row row-separated">
          <div v-if="stateOfCharge" class="col-span-3 flex flex-col">
            <va-icon name="icon-battery" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ stateOfCharge.value }}%</h3>
            <p class="va-text-center">{{ stateOfCharge.key }}</p>
          </div>
          <div v-if="panelPower" class="col-span-3 flex flex-col">
            <va-icon name="icon-solar" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ panelPower.value }}W</h3>
            <p class="va-text-center no-wrap">{{ panelPower.key }}</p>
          </div>
          <div v-if="Power" class="col-span-3 flex flex-col">
            <va-icon name="icon-bolt" :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ Power.value }}W</h3>
            <p class="va-text-center">{{ Power.key }}</p>
          </div>
          <div v-if="tanksCapacity" class="col-span-3 flex flex-col">
            <va-icon name="icon-tank" outline :size="64"></va-icon>
            <h3 class="va-h3 m-0 va-text-center">{{ tanksCapacity.value }}%</h3>
            <p class="va-text-center">{{ tanksCapacity.key }}</p>
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

    <va-card v-for="(info, idx) in infoTiles" :key="idx" :color="info.color" class="col-span-12 md:col-span-4">
      <router-link :to="info.text">
        <va-card-content>
          <h2 class="va-h2 m-0 text-white">{{ info.value }}</h2>
          <p class="text-white">{{ t('menu.' + info.text) }}</p>
        </va-card-content>
      </router-link>
    </va-card>

    <charts class="col-span-12" />

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
  import { ref, onMounted, version, computed } from 'vue'
  import { useGlobalStore } from '../../stores/global-store'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  import Charts from './Charts.vue'
  import lMap from '../../components/maps/leafletMap.vue'
  import PostgSail from '../../services/api-client'
  import moment from 'moment/min/moment-with-locales'
  import { dateFormatUTC } from '../../utils/dateFormatter'

  const { t, locale } = useI18n()
  const locale_mapping = { gb: 'en-gb', es: 'es', fr: 'fr', br: 'pt-br', de: 'de-de' }
  const moment_locale = computed(() => {
    return locale_mapping[locale.value]
  })

  const GlobalStore = useGlobalStore()
  const { userName, versions, currentWeather, Monitoring2 } = storeToRefs(GlobalStore)
  const { fetchVersions, fetchWeatherForecast, fetchMonitoring2 } = GlobalStore

  const CacheStore = useCacheStore()
  const { getInfoTiles } = storeToRefs(CacheStore)
  const { getAPI, InfoTiles, barChart, lineChartbyYear, matrixChartbyMonthDay } = CacheStore
  const { settings } = storeToRefs(GlobalStore)
  const badges = ref({
    Helmsman: { image: '/helmsman.png', description: t('badges.Helmsman') },
    'Wake Maker': { image: '/wake_maker.png', description: t('badges.Wake Maker') },
    Explorer: { image: '/explorer.png', description: t('badges.Explorer') },
    'Mooring Pro': { image: '/mooring_pro.png', description: t('badges.Mooring Pro') },
    Anchormaster: { image: '/anchormaster.png', description: t('badges.Anchormaster') },
    Traveler: { image: '/traveler.png', description: t('badges.Traveler') },
    Stormtrooper: { image: '/storm_trooper.png', description: t('badges.Stormtrooper') },
    'Club Alaska': { image: '/club_alaska.png', description: t('badges.Club Alaska') },
    'Tropical Traveler': { image: '/tropical_traveler.png', description: t('badges.Tropical Traveler') },
    'Navigator Award': { svg: true, description: t('badges.Navigator Award') },
    'Captain Award': { svg: true, description: t('badges.Captain Award') },
  })
  const default_badge = { default: { svg: false, description: t('badges.default') } }
  const user_badges = ref(settings.value.preferences.badges || {})

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
    obj.fromNow = moment().locale(moment_locale.value).format('LT')
    obj.last_updated = monitoring.value.time
      ? moment.utc(monitoring.value.time).locale(moment_locale.value).fromNow()
      : 'Pending'
    obj.monitoring = monitoring.value.time & !monitoring.value.offline ? 'Online' : 'Offline'
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

  onMounted(async () => {
    for (let key in badges.value) {
      //console.log(key, badges.value[key])
      if (key in user_badges.value && 'date' in user_badges.value[key]) {
        user_badges.value[key] = { ...user_badges.value[key], ...badges.value[key] }
        user_badges.value[key]['disabled'] = false
        user_badges.value[key]['date'] = dateFormatUTC(user_badges.value[key]['date'])
      } else {
        if (key in badges.value) {
          user_badges.value[key] = badges.value[key]
          user_badges.value[key]['disabled'] = true
        }
      }
    }
    for (let key in user_badges.value) {
      if (!(key in badges.value)) {
        user_badges.value[key] = { ...user_badges.value[key], ...default_badge['default'] }
        user_badges.value[key]['description'] = `${default_badge['default']['description']} ${key}!`
        user_badges.value[key]['disabled'] = false
        user_badges.value[key]['date'] = dateFormatUTC(user_badges.value[key]['date'])
      }
    }
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
  .dashboard {
    .va-card {
      margin-bottom: 0 !important;
      &__title {
        display: flex;
        justify-content: space-between;
      }
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
