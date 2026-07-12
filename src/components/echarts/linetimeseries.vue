<script setup>
  import { ref, computed } from 'vue'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'

  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, LegendComponent, TooltipComponent, TitleComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([GridComponent, LineChart, CanvasRenderer, LegendComponent, TooltipComponent, TitleComponent])

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

  const defaultConfig = ref({
    title: {
      text: 'Boat Speed and Wind Speed Over Time',
      left: 'center',
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        // params is an array of series data at the hovered x-axis value
        const time = params[0].axisValue // x-axis label
        let tooltipText = `<strong>${dateFormatUTC(time)}</strong><br/>`

        params.forEach((item) => {
          const value = Number(item.data).toFixed(2) // format to 2 decimals
          const unit = item.seriesName === 'Boat Speed' ? 'knots' : 'knots' // or change if units differ
          tooltipText += `
          <span style="display:inline-block;margin-right:4px;
            border-radius:50%;width:10px;height:10px;
            background-color:${item.color};"></span>
          ${item.seriesName}: ${value} ${unit}<br/>`
        })

        return tooltipText
      },
    },
    legend: {
      data: ['Boat Speed', 'Wind Speed'],
      //top: '10%'
    },
    xAxis: {
      type: 'category',
      data: props.series.map((item) => item[0]), // Time labels
      show: false,
    },
    yAxis: [
      {
        type: 'value',
        //name: 'Boat Speed',
        position: 'left',
      },
      {
        type: 'value',
        //name: 'Wind Speed',
        position: 'right',
      },
    ],
    series: [
      {
        name: 'Boat Speed',
        type: 'line',
        yAxisIndex: 0,
        data: props.series.map((item) => item[1]), // Boat speed data
        smooth: true,
        lineStyle: {
          color: 'blue',
        },
      },
      {
        name: 'Wind Speed',
        type: 'line',
        yAxisIndex: 1,
        data: props.series.map((item) => item[2]), // Wind speed data
        smooth: true,
        lineStyle: {
          color: 'red',
        },
      },
    ],
  })

  const chartOptions = computed(() => {
    //const localoptions = { ...defaultConfig }
    //if (Array.isArray(props.series) && props.series.length > 0) {
    //  //localoptions.dataset.source = props.series || []
    //}
    return defaultConfig.value
  })
  const themeOption = computed(() => {
    return props.theme || THEME_KEY.LIGHT
  })
</script>

<template>
  <div id="echarts">
    <v-chart :option="chartOptions" :theme="themeOption" autoresize />
  </div>
</template>

<style lang="scss">
  #echarts {
    height: 400px;
  }
</style>
