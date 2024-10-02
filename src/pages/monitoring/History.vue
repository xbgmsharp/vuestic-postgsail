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
    <div class="grid gap-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
      <div>
        <va-card v-if="windChartOptionsComputed">
          <va-card-title>{{ t('monitoring.wind.headerString') }}</va-card-title>
          <va-card-content>
            <ECharts :option="windChartOptionsComputed" autoresize class="w-full h-80" />
          </va-card-content>
        </va-card>
      </div>
      <div>
        <va-card v-if="temperaturesChartOptionsComputed">
          <va-card-title>{{ t('monitoring.temperature.headerString') }}</va-card-title>
          <va-card-content>
            <ECharts :option="temperaturesChartOptionsComputed" autoresize class="w-full h-80" />
          </va-card-content>
        </va-card>
      </div>
      <div>
        <va-card v-if="seaChartOptionsComputed">
          <va-card-title>{{ t('monitoring.water.headerString') }}</va-card-title>
          <va-card-content>
            <ECharts :option="seaChartOptionsComputed" autoresize class="w-full h-80" />
          </va-card-content>
        </va-card>
      </div>
      <div>
        <va-card v-if="humidityChartOptionsComputed">
          <va-card-title>{{ t('monitoring.humidity.headerString') }}</va-card-title>
          <va-card-content>
            <ECharts :option="humidityChartOptionsComputed" autoresize class="w-full h-80" />
          </va-card-content>
        </va-card>
      </div>
      <div>
        <va-card v-if="batteryChartOptionsComputed">
          <va-card-title>{{ t('monitoring.battery.headerString') }}</va-card-title>
          <va-card-content>
            <ECharts :option="batteryChartOptionsComputed" autoresize class="w-full h-80" />
          </va-card-content>
        </va-card>
      </div>
      <div>
        <va-card v-if="barometerChartOptionsComputed">
          <va-card-title>{{ t('monitoring.pressure.headerString') }}</va-card-title>
          <va-card-content>
            <ECharts :option="barometerChartOptionsComputed" autoresize class="w-full h-80" />
          </va-card-content>
        </va-card>
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
  import { computed, ref, reactive, onMounted, toRaw, defineComponent } from 'vue'
  //import VaChart from '../../components/va-charts/VaChart.vue'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { kelvinToHuman } from '../../utils/temperatureFormatter.js'
  import { pascalToHectoPascal } from '../../utils/presureFormatter.js'
  import { floatToPercentage } from '../../utils/percentageFormatter.js'
  import { default as utils } from '../../utils/utils.js'
  import PostgSail from '../../services/api-client'
  import useGlobalStore from '../../stores/global-store'
  import MySelect from '../../components/vaSelect.vue'
  import { useI18n } from 'vue-i18n'

  import ECharts from 'vue-echarts'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'

  // Register the required components
  use([TooltipComponent, LegendComponent, GridComponent, LineChart, CanvasRenderer, TitleComponent])

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

  /* Default echarts option */
  const defaultChartOptions = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      //data: labels.value,
      data: [],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} kts',
      },
    },
    series: [
      {
        name: 'Speed',
        type: 'line',
        //data: winddata.value,
        data: [],
      },
    ],
  }

  const windChartOptionsComputed = computed(() => {
    if (winddata.value && winddata.value.length == 0) return {}
    return {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} kts',
        },
      },
      series: [
        {
          name: 'Speed',
          type: 'line',
          data: winddata.value,
        },
      ],
    }
  })

  const temperaturesChartOptionsComputed = computed(() => {
    if (temperaturesdata.value && temperaturesdata.value.length == 0) return {}
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Inside', 'Outside', 'Sea'],
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: `{value} ${tempUnit.value}`,
        },
      },
      series: [
        {
          name: 'Inside',
          type: 'line',
          data: temperaturesdata.value[0],
        },
        {
          name: 'Outside',
          type: 'line',
          data: temperaturesdata.value[1],
          itemStyle: {
            color: ChartColorBis,
          },
        },
        {
          name: 'Sea',
          type: 'line',
          data: temperaturesdata.value[2],
          itemStyle: {
            color: ChartColorTer,
          },
        },
      ],
    }
  })

  const seaChartOptionsComputed = computed(() => {
    if (depthdata.value && depthdata.value.length == 0) return {}
    return {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: {
        type: 'value',
        name: `Depth (${depthUnit.value})`,
        axisLabel: {
          formatter: (value) => `${value} ${depthUnit.value}`,
        },
      },
      series: [
        {
          name: 'Depth',
          type: 'line',
          data: depthdata.value, // Sea depth data
          lineStyle: { color: '#6495ed' }, // Customize line color
          smooth: true,
        },
      ],
    }
  })

  const humidityChartOptionsComputed = computed(() => {
    if (humiditydata.value && humiditydata.value.length == 0) return {}
    console.log('humiditydata', {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Inside', 'Outside'],
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} %',
        },
      },
      series: [
        {
          name: 'Inside',
          type: 'line',
          data: humiditydata.value[0],
        },
        {
          name: 'Outside',
          type: 'line',
          data: humiditydata.value[1],
          itemStyle: {
            color: ChartColorBis,
          },
        },
      ],
    })
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Inside', 'Outside'],
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} %',
        },
      },
      series: [
        {
          name: 'Inside',
          type: 'line',
          data: humiditydata.value[0],
        },
        {
          name: 'Outside',
          type: 'line',
          data: humiditydata.value[1],
          itemStyle: {
            color: ChartColorBis,
          },
        },
      ],
    }
  })

  const batteryChartOptionsComputed = computed(() => {
    if (batterydata.value && batterydata.value.length == 0) return {}
    return {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Charge (%)',
          axisLabel: {
            formatter: '{value}%',
          },
        },
        {
          type: 'value',
          name: 'Voltage (V)',
          axisLabel: {
            formatter: '{value}V',
          },
          position: 'right',
          offset: 0,
        },
      ],
      series: [
        {
          name: 'Charge',
          type: 'line',
          yAxisIndex: 0,
          data: batterydata.value[1], // Battery charge data
          lineStyle: { color: '#ff7f50' }, // Customize line color
          smooth: true,
        },
        {
          name: 'Voltage',
          type: 'line',
          yAxisIndex: 1,
          data: batterydata.value[0], // Battery voltage data
          lineStyle: { color: '#87cefa' }, // Customize line color
          smooth: true,
        },
      ],
    }
  })
  const barometerChartOptionsComputed = computed(() => {
    if (barometerdata.value && barometerdata.value.length == 0) return {}
    return {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: labels.value,
      },
      yAxis: {
        type: 'value',
        name: 'Pressure (hPa)',
        axisLabel: {
          formatter: '{value} hPa',
        },
      },
      series: [
        {
          name: 'Atmospheric Pressure',
          type: 'line',
          data: barometerdata.value, // Barometer data
          lineStyle: { color: '#32cd32' }, // Customize line color
          smooth: true,
        },
      ],
    }
  })

  /* computed the labels from the api response */
  const labels = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        return dateFormatUTC(item.time_bucket)
      })
    }
    //console.log('labels arr:', arr.length)
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
    //console.log('winddata arr:', arr.length)
    return arr
  })

  const depthdata = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        let depth = GlobalStore.imperialUnits ? (item.depth || 0) * 3.2808399 : item.depth || 0
        return parseFloat(depth).toFixed(1)
      })
    }
    //console.log('depthdata arr:', arr.length)
    return arr
  })

  const barometerdata = computed(() => {
    let arr = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr = apiData.value.map(function (item) {
        return pascalToHectoPascal(item.outsidepressure)
      })
    }
    //console.log('barometerdata arr:', arr.length)
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
    //console.log('temperaturesdata arr:', [arr_inside, arr_outside, arr_water])
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
    //console.log('humiditydata arr:', [arr_inside, arr_outside])
    return [arr_inside, arr_outside]
  })

  const batterydata = computed(() => {
    let arr_volt,
      arr_charge = []
    if (Array.isArray(apiData.value) && apiData.value.length > 0) {
      arr_volt = apiData.value.map(function (item) {
        return parseFloat(item.batteryvoltage).toFixed(1)
      })
      arr_charge = apiData.value.map(function (item) {
        return floatToPercentage(item.batterycharge)
      })
    }
    //console.log('batterydata arr:', [arr_volt, arr_charge])
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
          apiSuccess.value = true
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
