<template>
  <template v-if="apiError">
    <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
  </template>
  <template v-if="offline">
    <Offline />
  </template>
  <template v-if="!offline && apiSuccess">
    <va-card class="mb-3">
      <va-card-content>
        <div class="layout gutter--md self-center items-center align-center">
          <div class="py-2" style="min-width: 150px; max-width: 15%">
            <MySelect
              v-if="history_type"
              :id="period"
              key="map_type"
              :data="period"
              :object="history_type"
              @clickFromChildComponent="handlePeriod"
            />
          </div>
        </div>
      </va-card-content>
    </va-card>
    <div class="mb-3">
      <div class="grid grid-cols-2 gap-3 self-center">
        <div>
          <va-card v-if="windChartDataComputed" class="chart-widget md:col-span-6 col-span-12">
            <va-card-title>{{ t('monitoring.wind.headerString') }}</va-card-title>
            <va-card-content>
              <va-chart :data="windChartDataComputed" type="line" :options="windChartOptionsComputed" />
            </va-card-content>
          </va-card>
        </div>
        <div>
          <va-card v-if="temperaturesChartDataComputed" class="chart-widget md:col-span-6 col-span-12">
            <va-card-title>{{ t('monitoring.temperature.headerString') }}</va-card-title>
            <va-card-content>
              <va-chart :data="temperaturesChartDataComputed" type="line" :options="temperaturesChartOptionsComputed" />
            </va-card-content>
          </va-card>
        </div>
        <div>
          <va-card v-if="seaChartDataComputed" class="chart-widget md:col-span-6 col-span-12">
            <va-card-title>{{ t('monitoring.water.headerString') }}</va-card-title>
            <va-card-content>
              <va-chart :data="seaChartDataComputed" type="line" :options="seaChartOptionsComputed" />
            </va-card-content>
          </va-card>
        </div>
        <div>
          <va-card v-if="humidityChartDataComputed" class="chart-widget md:col-span-6 col-span-12">
            <va-card-title>{{ t('monitoring.humidity.headerString') }}</va-card-title>
            <va-card-content>
              <va-chart :data="humidityChartDataComputed" type="line" :options="humidityChartOptionsComputed" />
            </va-card-content>
          </va-card>
        </div>
        <div>
          <va-card v-if="batteryChartDataComputed" class="chart-widget md:col-span-6 col-span-12">
            <va-card-title>{{ t('monitoring.battery.headerString') }}</va-card-title>
            <va-card-content>
              <va-chart :data="batteryChartDataComputed" type="line" :options="batteryChartOptionsComputed" />
            </va-card-content>
          </va-card>
        </div>
        <div>
          <va-card v-if="barometerChartDataComputed" class="chart-widget md:col-span-6 col-span-12">
            <va-card-title>{{ t('monitoring.pressure.headerString') }}</va-card-title>
            <va-card-content>
              <va-chart :data="barometerChartDataComputed" type="line" :options="barometerChartOptionsComputed" />
            </va-card-content>
          </va-card>
        </div>
      </div>
    </div>
  </template>
</template>

<script>
  import Offline from '../../components/MonitoringOffline.vue'

  export default {
    name: 'History',
    components: {
      Offline,
    },
  }
</script>

<script setup>
  // TODO update setup with lang="ts"
  import { computed, ref, reactive, onMounted, toRaw } from 'vue'
  import { setAppTitle } from '../../utils/app.js'
  import VaChart from '../../components/va-charts/VaChart.vue'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { kelvinToHuman } from '../../utils/temperatureFormatter.js'
  import { pascalToHectoPascal } from '../../utils/presureFormatter.js'
  import { floatToPercentage } from '../../utils/percentageFormatter.js'
  import { default as utils } from '../../utils/utils.js'
  import PostgSail from '../../services/api-client'
  import useGlobalStore from '../../stores/global-store'
  import MySelect from '../../components/vaSelect.vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const GlobalStore = useGlobalStore()
  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const apiData = ref([])
  const offline = ref(false)
  const period = ref(0)

  const history_type = [
    {
      value: 0,
      text: '24 hours',
      desc: 24,
    },
    {
      value: 1,
      text: '48 hours',
      desc: 48,
    },
    {
      value: 2,
      text: '72 hours',
      desc: 72,
    },
    {
      value: 3,
      text: '7 days',
      desc: 168,
    },
  ]

  /* Default Chartjs Additional color */
  const ChartColorBis = 'rgb(154, 208, 245)'
  const ChartbgColorBis = 'rgb(154, 208, 245, 0.5)'
  const ChartColorTer = 'rgb(255, 207, 159)'
  const ChartbgColorTer = 'rgb(255, 207, 159, 0.5)'

  /* Default Chartjs Data */
  const ChartDataDefault = {
    labels: [],
    datasets: [
      {
        label: 'Default',
        data: [],
        fill: false,
        tension: 0.5,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  }
  /* Default Chartjs Options */
  const ChartOptionsDefault = {
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        // beginAtZero: true
      },
      y: {
        // beginAtZero: true
        ticks: {},
      },
    },
  }

  const windChartOptionsComputed = computed(() => {
    let windChartOptions = structuredClone(ChartOptionsDefault)
    windChartOptions.scales.y.ticks.callback = (value) => {
      return value + 'kts'
    }
    console.log(windChartOptions)
    return windChartOptions
  })
  const windChartDataComputed = computed(() => {
    //console.log('windChartDataComputed', ChartDataDefault)
    //console.log('winddata', winddata.value)
    let windChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(winddata.value) && winddata.value.length > 0) {
      windChartData.datasets[0].label = 'Speed'
      windChartData.datasets[0].data = winddata.value
      windChartData.labels = labels.value
    }
    console.log(windChartData)
    return windChartData
  })
  const temperaturesChartOptionsComputed = computed(() => {
    let tempChartOptions = structuredClone(ChartOptionsDefault)
    tempChartOptions.scales.y.ticks.callback = (value) => {
      return value + tempUnit.value
    }
    console.log(tempChartOptions)
    return tempChartOptions
  })
  const temperaturesChartDataComputed = computed(() => {
    let tempChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(temperaturesdata.value) && temperaturesdata.value.length > 0 && Array.isArray(labels.value)) {
      tempChartData.datasets[0].label = 'Inside'
      tempChartData.datasets[0].data = temperaturesdata.value[0]
      tempChartData.datasets[1] = {
        label: 'Outside',
        fill: false,
        data: temperaturesdata.value[1],
        borderColor: ChartColorBis,
        backgroundColor: ChartbgColorBis,
      }
      tempChartData.datasets[2] = {
        label: 'Sea',
        fill: false,
        data: temperaturesdata.value[2],
        borderColor: ChartColorTer,
        backgroundColor: ChartbgColorTer,
      }
      tempChartData.labels = labels.value
      console.log(tempChartData)
    }
    return tempChartData
  })
  const seaChartOptionsComputed = computed(() => {
    let seaChartOptions = structuredClone(ChartOptionsDefault)
    seaChartOptions.scales.y.ticks.callback = (value) => {
      return value + depthUnit.value
    }
    console.log(seaChartOptions)
    return seaChartOptions
  })
  const seaChartDataComputed = computed(() => {
    let seaChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(depthdata.value) && depthdata.value.length > 0 && Array.isArray(labels.value)) {
      seaChartData.datasets[0].label = 'Depth'
      seaChartData.datasets[0].data = depthdata.value
      seaChartData.labels = labels.value
    }
    console.log('seaChartData', seaChartData)
    return seaChartData
  })
  const humidityChartOptionsComputed = computed(() => {
    let humidityChartOptions = structuredClone(ChartOptionsDefault)
    humidityChartOptions.scales.y.ticks.callback = (value) => {
      return value + '%'
    }
    console.log(humidityChartOptions)
    return humidityChartOptions
  })
  const humidityChartDataComputed = computed(() => {
    let humidityChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(humiditydata.value) && humiditydata.value.length > 0 && Array.isArray(labels.value)) {
      humidityChartData.datasets[0].label = 'Inside'
      humidityChartData.datasets[0].data = humiditydata.value[0]
      humidityChartData.datasets[1] = {
        label: 'Outside',
        fill: false,
        data: humiditydata.value[1],
        borderColor: ChartColorBis,
        backgroundColor: ChartbgColorBis,
      }
      humidityChartData.labels = labels.value
    }
    return humidityChartData
  })
  const batteryChartOptionsComputed = computed(() => {
    let batteryChartOptions = structuredClone(ChartOptionsDefault)
    //batteryChartOptions.scales.y1 = structuredClone(batteryChartOptions.scales.y)
    batteryChartOptions.scales.y.ticks.callback = (value) => {
      return value + '%'
    }
    batteryChartOptions.scales.y1 = {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
      ticks: {
        callback: function (value) {
          value = Math.round(value * 100) / 100
          return value + 'V'
        },
      },
    }
    console.log(batteryChartOptions)
    return batteryChartOptions
  })
  const batteryChartDataComputed = computed(() => {
    let batteryChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(batterydata.value) && batterydata.value.length > 0 && Array.isArray(labels.value)) {
      batteryChartData.datasets[0].label = 'Charge'
      batteryChartData.datasets[0].yAxisID = 'y'
      batteryChartData.datasets[0].data = batterydata.value[1]
      batteryChartData.datasets[1] = {
        label: 'Voltage',
        fill: false,
        data: batterydata.value[0],
        borderColor: ChartColorBis,
        backgroundColor: ChartbgColorBis,
        yAxisID: 'y1',
      }
      batteryChartData.labels = labels.value
    }
    return batteryChartData
  })
  const barometerChartOptionsComputed = computed(() => {
    let barometerChartOptions = structuredClone(ChartOptionsDefault)
    barometerChartOptions.scales.y.ticks.callback = (value) => {
      return value + ' hPa'
    }
    console.log(barometerChartOptions)
    return barometerChartOptions
  })
  const barometerChartDataComputed = computed(() => {
    console.log('barometerChartDataComputed', ChartDataDefault)
    let barometerChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(barometerdata.value) && barometerdata.value.length > 0 && Array.isArray(labels.value)) {
      barometerChartData.datasets[0].label = 'Atmospheric Pressure'
      barometerChartData.datasets[0].data = barometerdata.value
      barometerChartData.labels = labels.value
    }
    console.log('barometerChartData', barometerChartData)
    return barometerChartData
  })

  /* computed the labels from the api response */
  const labels = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        return dateFormatUTC(item.time_bucket)
      })
    }
    console.log('labels arr:', arr.length)
    return arr
  })

  /* computed the data from the api response */
  const winddata = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        return utils.metersToKnots(item.windspeedoverground)
      })
    }
    console.log('winddata arr:', arr.length)
    return arr
  })

  const depthdata = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        //return item.depth
        return GlobalStore.imperialUnits ? (item.depth || 0) * 3.2808399 : item.depth || 0
      })
    }
    console.log('depthdata arr:', arr.length)
    return arr
  })

  const barometerdata = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        return pascalToHectoPascal(item.outsidepressure)
      })
    }
    console.log('barometerdata arr:', arr.length)
    return arr
  })

  const temperaturesdata = computed(() => {
    let arr_inside,
      arr_outside,
      arr_water = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr_inside = apiData.value.map(function (item) {
        return kelvinToHuman(item.insidetemperature)
      })
      arr_outside = apiData.value.map(function (item) {
        return kelvinToHuman(item.outsidetemperature)
      })
      arr_water = apiData.value.map(function (item) {
        return kelvinToHuman(item.watertemperature)
      })
    }
    console.log('temperaturesdata arr:', [arr_inside, arr_outside, arr_water])
    return [arr_inside, arr_outside, arr_water]
  })

  const humiditydata = computed(() => {
    let arr_inside,
      arr_outside = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr_inside = apiData.value.map(function (item) {
        return floatToPercentage(item.insidehumidity)
      })
      arr_outside = apiData.value.map(function (item) {
        return floatToPercentage(item.outsidehumidity)
      })
    }
    console.log('humiditydata arr:', [arr_inside, arr_outside])
    return [arr_inside, arr_outside]
  })

  const batterydata = computed(() => {
    let arr_volt,
      arr_charge = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr_volt = apiData.value.map(function (item) {
        return item.batteryvoltage
      })
      arr_charge = apiData.value.map(function (item) {
        return floatToPercentage(item.batterycharge)
      })
    }
    console.log('batterydata arr:', [arr_volt, arr_charge])
    return [arr_volt, arr_charge]
  })

  const fetchHistory = async function (interval) {
    isBusy.value = true
    apiError.value = null
    apiData.value = []
    const api = new PostgSail()
    try {
      const response = await api.history({ time_interval: interval })
      if (response?.history_metrics && Array.isArray(response.history_metrics)) {
        console.log('response', response)
        apiData.value.splice(0, apiData.value.length || [])
        apiSuccess.value = true
        offline.value = false
        apiData.value.push(...response.history_metrics)
        //console.log('response', apiData.value[0].time_bucket)
      } else {
        console.warn('history response error:', response)
        if (response.history_metrics === null) {
          offline.value = true
          // if null it is not an error
          return
        }
        throw { response }
      }
    } catch ({ response }) {
      console.log(response)
      apiError.value = t('history.error')
      offline.value = false
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
      }
    } finally {
      isBusy.value = false
    }
  }

  onMounted(async () => {
    const title = t('monitoring.history.title')
    document.title = setAppTitle(title)

    await fetchHistory('24')
  })

  const tempUnit = computed(() => {
    return GlobalStore.imperialUnits
      ? t('monitoring.imperial_units.temperature')
      : t('monitoring.temperature.unitString')
  })

  const depthUnit = computed(() => {
    return GlobalStore.imperialUnits ? t('monitoring.imperial_units.depth') : t('monitoring.water.unitString')
  })

  const handlePeriod = async (new_value, obj) => {
    console.log('handlePeriod', new_value, obj)
    if (new_value >= 0) {
      console.log('handlePeriod obj:', obj.value + ', text:' + obj.text + ', desc:' + obj.desc)
      await fetchHistory(obj.desc)
    }
  }
</script>

<style></style>
