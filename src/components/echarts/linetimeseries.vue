<script setup>
  import { ref, computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([GridComponent, LineChart, CanvasRenderer, LegendComponent, TooltipComponent])

  const props = defineProps({
    series: {
      type: Array,
      required: true,
    },
  })

  // prettier-ignore
  const defaultConfig = {
  title: {
    text: 'Boat Speed and Wind Speed Over Time',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['Boat Speed', 'Wind Speed'],
    top: '10%'
  },
  xAxis: {
    type: 'category',
    data: props.series.map(item => item[0]), // Time labels
  },
  yAxis: [
    {
      type: 'value',
      name: 'Boat Speed',
      position: 'left'
    },
    {
      type: 'value',
      name: 'Wind Speed',
      position: 'right'
    }
  ],
  series: [
    {
      name: 'Boat Speed',
      type: 'line',
      yAxisIndex: 0,
      data: props.series.map(item => item[1]), // Boat speed data
      smooth: true,
      lineStyle: {
        color: 'blue'
      }
    },
    {
      name: 'Wind Speed',
      type: 'line',
      yAxisIndex: 1,
      data: props.series.map(item => item[2]), // Wind speed data
      smooth: true,
      lineStyle: {
        color: 'red'
      }
    }
  ]
}

  const chartOptions = computed(() => {
    const localoptions = { ...defaultConfig }
    if (Array.isArray(props.series) && props.series.length > 0) {
      //localoptions.dataset.source = props.series || []
    }
    return localoptions
  })
</script>

<template>
  <div id="echarts">
    <v-chart :option="chartOptions" autoresize />
  </div>
</template>

<style lang="scss">
  #echarts {
    height: 400px;
  }
</style>
