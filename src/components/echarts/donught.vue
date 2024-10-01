<script setup>
  import { ref, computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent, LegendComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

  const props = defineProps({
    series: {
      type: Array,
      required: true,
    },
  })

  const defaultConfig = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
          { value: 484, name: 'Union Ads' },
          { value: 300, name: 'Video Ads' },
        ],
      },
    ],
  }

  const chartOptions = computed(() => {
    const localoptions = { ...defaultConfig }
    localoptions.series[0].data = props.series || []
    return localoptions
  })
</script>

<template>
  <div id="donught">
    <v-chart :option="chartOptions" autoresize />
  </div>
</template>

<style lang="scss">
  #donught {
    height: 400px;
  }
</style>
