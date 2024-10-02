<script setup>
  import { ref, computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart, LineChart } from 'echarts/charts'
  import { TooltipComponent, ToolboxComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  use([TooltipComponent, ToolboxComponent, LegendComponent, GridComponent, BarChart, LineChart, CanvasRenderer])

  const props = defineProps({
    series: {
      type: Array,
      required: true,
    },
  })

  const defaultConfig = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      show: true,
      top: '5%',
      left: 'center',
    },
    xAxis: [
      {
        type: 'category',
        data: [
          t('dashboard.months.january'),
          t('dashboard.months.february'),
          t('dashboard.months.march'),
          t('dashboard.months.april'),
          t('dashboard.months.may'),
          t('dashboard.months.june'),
          t('dashboard.months.july'),
          t('dashboard.months.august'),
          t('dashboard.months.september'),
          t('dashboard.months.october'),
          t('dashboard.months.november'),
          t('dashboard.months.december'),
        ],
        axisPointer: {
          type: 'shadow',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Log entry',
        min: 0,
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    series: [],
  }
  const chartOptions = computed(() => {
    const localoptions = { ...defaultConfig }
    localoptions['series'] = props.series || []
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
