<template>
  <va-card class="leaflet-map__full">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
    </template>
    <template v-if="!offline && apiSuccess">
      <template v-if="items.geojson">
        <lMap
          id="monitoring-map"
          :side-panel="sidePanelTemplate"
          :geo-json-feature="mapGeoJsonFeatures"
          :map-zoom="13"
          map-type="Satellite"
        />
      </template>
    </template>
  </va-card>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { computed, ref, reactive, onMounted } from 'vue'
  import { setAppTitle } from '../../utils/app.js'
  import PostgSail from '../../services/api-client'
  import lMap from '../../components/maps/leafletMap.vue'
  import { useI18n } from 'vue-i18n'
  import { kelvinToHuman } from '../../utils/temperatureFormatter.js'
  import { pascalToHectoPascal } from '../../utils/presureFormatter.js'
  import { floatToPercentage } from '../../utils/percentageFormatter.js'
  import { fromNow, nowUTC } from '../../utils/dateFormatter.js'
  import { default as utils } from '../../utils/utils.js'

  import monitoringDatas from '../../data/monitoring.json'
  import useGlobalStore from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const apiData = reactive({ row: null })
  const offline = ref(true)

  const sidePanelTemplate = computed(() => {
    return `<div id="sidepanel" class="sidepanel" aria-label="side panel" aria-hidden="false">
      <div class="sidepanel-inner-wrapper">
        <nav class="sidepanel-tabs-wrapper" aria-label="sidepanel tab navigation">
          <ul class="sidepanel-tabs">
            <li class="sidepanel-tab">
              <a href="#vessel" class="sidebar-tab-link" role="tab" data-tab-link="tab-1">
                VESSEL NAME
              </a>
            </li>
          </ul>
        </nav>
        <div class="sidepanel-content-wrapper">
          <div class="sidepanel-content">
            <div class="sidepanel-tab-content" data-tab-content="tab-1">
              <h1>TESTING</h1>
            </div>
          </div>
        </div>
      </div>
      <div class="sidepanel-toggle-container">
        <button class="sidepanel-toggle-button" type="button" aria-label="toggle side panel"></button>
      </div>
    </div>
    `
  })
  const items = computed(() => {
    return apiData.row
      ? {
          wind: {
            headerString: t('monitoring.wind.headerString'),
            unitString: t('monitoring.wind.unitString'),
            detailString: t('monitoring.wind.detailString'),
            detailUnitString: 'deg',
            lcdDecimals: 0,
            value: utils.metersToKnots(apiData.row.windspeedoverground) || 0,
            altValue: utils.radiantToDegrees(apiData.row.winddirectiontrue) || 0,
          },
          temperature: {
            headerString: t('monitoring.temperature.headerString'),
            unitString: tempUnit.value,
            detailString: t('monitoring.temperature.detailString'),
            detailUnitString: tempUnit.value,
            lcdDecimals: 1,
            value: kelvinToHuman(apiData.row.insidetemperature) || 0.0,
            altValue: kelvinToHuman(apiData.row.outsidetemperature) || 0.0,
          },
          water: {
            headerString: t('monitoring.water.headerString'),
            unitString: depthUnit.value,
            detailString: t('monitoring.water.detailString'),
            detailUnitString: tempUnit.value,
            lcdDecimals: 1,
            value: meterToFeet.value || 0,
            altValue: kelvinToHuman(apiData.row.watertemperature) || 0.0,
          },
          battery: {
            headerString: t('monitoring.battery.headerString'),
            unitString: t('monitoring.battery.unitString'),
            detailString: t('monitoring.battery.detailString'),
            detailUnitString: 'V',
            lcdDecimals: 1,
            value: floatToPercentage(apiData.row.batterycharge) || 0,
            altValue: apiData.row.batteryvoltage || 0,
          },
          humidity: {
            headerString: t('monitoring.humidity.headerString'),
            unitString: t('monitoring.humidity.unitString'),
            detailString: t('monitoring.humidity.detailString'),
            detailUnitString: t('monitoring.humidity.unitString'),
            lcdDecimals: 0,
            value: floatToPercentage(apiData.row.insidehumidity) || 0,
            altValue: floatToPercentage(apiData.row.outsidehumidity) || 0,
          },
          pressure: {
            headerString: t('monitoring.pressure.headerString'),
            unitString: t('monitoring.pressure.unitString'),
            detailString: t('monitoring.pressure.detailString'),
            detailUnitString: t('monitoring.pressure.unitString'),
            lcdDecimals: 1,
            value: pascalToHectoPascal(apiData.row.insidepressure) || 0.0,
            altValue: pascalToHectoPascal(apiData.row.outsidepressure) || 0.0,
          },
          vessel_name: apiData.row.name,
          geojson: apiData.row.geojson,
        }
      : {}
  })

  const msg_fromNow = computed(() => {
    return fromNow(apiData.row.time)
  })

  const sub_msg = computed(() => {
    return apiData.row.time && !apiData.row.offline ? 'Online' : 'Offline'
  })

  const mapGeoJsonFeatures = computed(() => {
    return apiData.row.geojson
  })

  const tempUnit = computed(() => {
    return GlobalStore.imperialUnits
      ? t('monitoring.imperial_units.temperature')
      : t('monitoring.temperature.unitString')
  })

  const depthUnit = computed(() => {
    return GlobalStore.imperialUnits ? t('monitoring.imperial_units.depth') : t('monitoring.water.unitString')
  })

  const meterToFeet = computed(() => {
    return GlobalStore.imperialUnits ? (apiData.row.depth || 0) * 3.2808399 : apiData.row.depth || 0
  })

  const windDirection = computed(() => ({
    rotate: `${utils.radiantToDegrees(apiData.row.winddirectiontrue) - 180}deg`,
  }))

  const monitor = onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.monitoring()
      if (Array.isArray(response) && response[0]) {
        //console.log(response[0])
        apiSuccess.value = true
        offline.value = false
        //offline.value = response[0].offline
        apiData.row = response[0]
        //console.log(apiData)
        //console.log(response[0].time)
        //console.log(moment.utc(response[0].time).locale('es').fromNow())
        setTimeout(() => monitor(), 60 * 1000) // 1 min
        if (apiData.row.name) {
          document.title = setAppTitle(t('monitoring.title') + ': ' + apiData.row.name)
        }
      } else {
        console.warn('monitoring', response)
        //throw { response }
      }
    } catch ({ response }) {
      console.log(response)
      apiError.value = t('monitoring.error')
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        //console.log(monitoringDatas[0].time)
        // Update time to now
        monitoringDatas[0].time = nowUTC()
        apiData.row = monitoringDatas[0]
      }
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss">
  #monitoring-map {
    width: 100%;
    height: calc(100vh - 4.5rem);
  }
</style>
