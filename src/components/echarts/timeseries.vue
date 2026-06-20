<script setup>
  import { computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { LegendComponent, TooltipComponent, DatasetComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { pascalToHectoPascal } from '../../utils/presureFormatter.js'

  use([LegendComponent, TooltipComponent, DatasetComponent, GridComponent, LineChart, CanvasRenderer])

  const props = defineProps({
    series: {
      type: Array,
      required: true,
    },
    theme: {
      type: String,
      default: THEME_KEY.LIGHT,
    },
  })

  const data = [
    ['2018-04-10T20:40:33Z', 1, 5],
    ['2018-04-10T20:40:53Z', 2, 3],
    ['2018-04-10T20:41:03Z', 4, 2],
    ['2018-04-10T20:44:03Z', 5, 1],
    ['2018-04-10T20:45:03Z', 6, 0],
  ]
  const defaultConfig = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        data: [],
        type: 'line',
        smooth: true,
        name: 'Outside Pressure',
        showSymbol: false, // optional: hides circle at each point
        lineStyle: {
          width: 2,
          color: '#5470C6', // optional: customize line color
        },
      },
    ],
  }

  const chartOptions = computed(() => {
    const localoptions = JSON.parse(JSON.stringify(defaultConfig))
    if (Array.isArray(props.series) && props.series.length > 0) {
      //console.log(props.series)
      localoptions.xAxis.data = props.series.map((p) => dateFormatUTC(p.time))
      localoptions.series[0].data = props.series.map((p) => pascalToHectoPascal(p.outsidePressure))
    }
    localoptions.backgroundColor = props.theme === 'dark' ? '#191a1d' : ''
    //console.log('chartOptions', localoptions)
    return localoptions
  })
  const themeOption = computed(() => {
    return props.theme || THEME_KEY.LIGHT
  })
</script>

<template>
  <div id="echarts" class="my-graph">
    <v-chart :option="chartOptions" :theme="themeOption" autoresize />
  </div>
</template>

<style lang="scss">
  .my-graph {
    width: 100%;
    height: 100%;
  }
</style>
