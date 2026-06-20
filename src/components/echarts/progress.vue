<script setup>
  import { computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { GridComponent, TitleComponent, LegendComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([GridComponent, TitleComponent, LegendComponent, TooltipComponent, BarChart, CanvasRenderer])

  const props = defineProps({
    series: {
      type: Array,
      required: true,
    },
    theme: {
      type: String,
      default: THEME_KEY.LIGHT,
    },
    title: {
      type: String,
      default: 'Title',
    },
    max: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      default: '°C',
    },
    alarm: {
      type: Number,
      default: null,
    },
  })

  const defaultConfig = {
    legend: {
      show: true,
    },
    title: {
      text: 'Device Temp',
      left: 'center',
      top: 5,
      textStyle: { fontSize: 14 },
    },
    grid: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 40, // <- Set to a realistic max temp
      show: false,
    },
    yAxis: {
      type: 'category',
      data: [''],
      show: false,
    },
    series: [
      {
        // Background bar (full thermometer scale)
        type: 'bar',
        data: [40],
        barWidth: 30,
        barGap: '-100%',
        itemStyle: {
          color: '#eee',
          borderRadius: 10,
        },
        z: 1,
      },
      {
        // Foreground (actual temp)
        type: 'bar',
        data: [72],
        barWidth: 30,
        itemStyle: {
          borderRadius: 10,
          color: '#5470c6',
        },
        label: {
          show: true,
          position: 'insideRight',
          formatter: '{c} °C',
          fontWeight: 'bold',
          color: '#fff',
          fontSize: 12,
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: 'red',
            width: 2,
            type: 'solid',
          },
          data: [
            { xAxis: 30 }, // <-- Alert threshold at 30°C
          ],
        },
        z: 2,
      },
    ],
  }

  const chartOptions = computed(() => {
    const localoptions = { ...defaultConfig }
    localoptions.title.text = props.title || 'Title'
    localoptions.series[1].data = props.series || []
    localoptions.series[1].label.formatter = '{c} ' + props.unit
    localoptions.series[1].markLine.data[0].xAxis = props.alarm
    localoptions.xAxis.max = props.max ? props.max : props.series[0] + 10
    localoptions.series[0].data = props.max ? [props.max] : [props.series[0] + 10]
    localoptions.backgroundColor = props.theme === 'dark' ? '#191a1d' : ''
    return localoptions
  })
  const themeOption = computed(() => {
    return props.theme || THEME_KEY.LIGHT
  })
</script>

<template>
  <div id="progress">
    <v-chart :option="chartOptions" :theme="themeOption" autoresize />
  </div>
</template>

<style lang="scss">
  #progress {
    width: 100%;
    height: 100%;
  }
</style>
