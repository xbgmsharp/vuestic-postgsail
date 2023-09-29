<template>
  <template v-if="apiError">
    <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
  </template>
  <template v-if="offline">
    <Offline />
  </template>
  <template v-if="!offline && apiSuccess">
    <va-card class="mb-3">
      <va-card-title>{{ $t('monitoring.title') }}</va-card-title>
      <va-card-content>
        <h1 class="box layout gutter--md">{{ items.vessel_name }} {{ msg_fromNow }}</h1>

        <div class="box layout gutter--md" style="width: 100%; text-align: center">
          <template v-if="items.geojson">
            <lMap :geo-json-feature="mapGeoJsonFeatures" style="width: 100%; height: 250px" />
          </template>
        </div>

        <div class="box layout gutter--md">
          <table>
            <tr>
              <td>
                <display-lcd id="wind" :display="items.wind"></display-lcd><br />
                <display-lcd id="temperature" :display="items.temperature"></display-lcd><br />
                <display-lcd id="battery" :display="items.battery"></display-lcd><br />
              </td>
              <td>
                <display-lcd id="humidity" :display="items.humidity"></display-lcd><br />
                <display-lcd id="water" :display="items.water"></display-lcd><br />
                <display-lcd id="pressure" :display="items.pressure"></display-lcd><br />
              </td>
            </tr>
          </table>
        </div>
      </va-card-content>
    </va-card>
  </template>
</template>

<script>
  import DisplayMulti from '../../components/DisplayMulti.vue'
  import Offline from '../../components/MonitoringOffline.vue'

  export default {
    name: 'Monitoring',
    components: {
      'display-lcd': DisplayMulti,
      Offline,
    },
  }
</script>

<script setup>
  // TODO update setup with lang="ts"
  import { computed, ref, reactive, onMounted } from 'vue'
  import PostgSail from '../../services/api-client'
  import lMap from '../../components/maps/leafletMap.vue'
  import { useI18n } from 'vue-i18n'
  import { kelvinToCelsius } from '../../utils/temperatureFormatter.js'
  import { pascalToHectoPascal } from '../../utils/presureFormatter.js'
  import { floatToPercentage } from '../../utils/percentageFormatter.js'
  import { fromNow, nowUTC } from '../../utils/dateFormatter.js'

  import monitoringDatas from '../../data/monitoring.json'

  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const apiData = reactive({ row: null })
  const offline = ref(true)

  const items = computed(() => {
    return apiData.row
      ? {
          wind: {
            headerString: t('monitoring.wind.headerString'),
            unitString: t('monitoring.wind.unitString'),
            detailString: t('monitoring.wind.detailString'),
            lcdDecimals: 0,
            value: apiData.row.windspeedoverground || 0,
            altValue: apiData.row.winddirectionground || 0,
          },
          temperature: {
            headerString: t('monitoring.temperature.headerString'),
            unitString: t('monitoring.temperature.unitString'),
            detailString: t('monitoring.temperature.detailString'),
            lcdDecimals: 1,
            value: kelvinToCelsius(apiData.row.insidetemperature) || 0.0,
            altValue: kelvinToCelsius(apiData.row.outsidetemperature) || 0.0,
          },
          water: {
            headerString: t('monitoring.water.headerString'),
            unitString: t('monitoring.water.unitString'),
            detailString: t('monitoring.water.detailString'),
            lcdDecimals: 1,
            value: apiData.row.depth || 0,
            altValue: kelvinToCelsius(apiData.row.watertemperature) || 0.0,
          },
          battery: {
            headerString: t('monitoring.battery.headerString'),
            unitString: t('monitoring.battery.unitString'),
            detailString: t('monitoring.battery.detailString'),
            lcdDecimals: 1,
            value: floatToPercentage(apiData.row.batterycharge) || 0,
            altValue: apiData.row.batteryvoltage || 0,
          },
          humidity: {
            headerString: t('monitoring.humidity.headerString'),
            unitString: t('monitoring.humidity.unitString'),
            detailString: t('monitoring.humidity.detailString'),
            lcdDecimals: 0,
            value: floatToPercentage(apiData.row.insidehumidity) || 0,
            altValue: floatToPercentage(apiData.row.outsidehumidity) || 0,
          },
          pressure: {
            headerString: t('monitoring.pressure.headerString'),
            unitString: t('monitoring.pressure.unitString'),
            detailString: t('monitoring.pressure.detailString'),
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

  const mapGeoJsonFeatures = computed(() => {
    return apiData.row.geojson
  })

  const monitor = onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.monitoring()
      if (Array.isArray(response) && response[0]) {
        //console.log(response[0])
        apiSuccess.value = true
        //offline.value = true
        offline.value = response[0].offline
        apiData.row = response[0]
        //console.log(apiData)
        //console.log(response[0].time)
        //console.log(moment.utc(response[0].time).locale('es').fromNow())
        setTimeout(() => monitor(), 60 * 1000) // 1 min
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

<style>
  .box {
    align-items: center;
    justify-content: center;
    /*background: white;*/
    /*border-radius: 10px;*/
    /*border: 1px solid #ccc;*/
    padding: 20px 10px;
    text-align: center;
    width: 40%;
  }
</style>
