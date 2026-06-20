<script setup>
  import { computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent, LegendComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import moment from 'moment'

  use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

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

  const defaultConfig = {
    textStyle: {
      color: '#000',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        // params.value is the numeric value you set in data
        const days = Number(params.value)
        const duration = moment.duration(days, 'days')

        let formatted = ''
        if (duration.asDays() >= 1) {
          formatted = `${Math.floor(duration.asDays())}d`
        } else if (duration.asHours() >= 1) {
          formatted = `${Math.floor(duration.asHours())}h`
        } else {
          formatted = `${Math.floor(duration.asMinutes())}m`
        }

        return `${params.marker}${params.name}: ${formatted}`
      },
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
    localoptions.backgroundColor = props.theme === 'dark' ? '#1f262f' : ''
    return localoptions
  })
  const themeOption = computed(() => {
    return props.theme || THEME_KEY.LIGHT
  })
</script>

<template>
  <div id="donught">
    <v-chart :option="chartOptions" :theme="themeOption" autoresize />
  </div>
</template>

<style lang="scss">
  #donught {
    height: 400px;
  }
</style>
