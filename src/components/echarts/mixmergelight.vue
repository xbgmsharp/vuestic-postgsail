<template>
  <div class="time-series-chart">
    <div id="echarts">
      <v-chart :option="chartOptions" :theme="themeOption" autoresize />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart, BarChart } from 'echarts/charts'
  import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  use([LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

  const props = defineProps({
    data: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    granularity: {
      type: String,
      default: 'month',
      validator: (v) => ['month', 'week'].includes(v),
    },
    theme: {
      type: String,
      default: THEME_KEY.LIGHT,
    },
  })

  // Translated month labels
  const monthLabels = computed(() => [
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
  ])

  // Week labels with localized prefix
  const weekLabels = computed(() => {
    const prefix = t('dashboard.week_prefix') // "W" or "S"
    return Array.from({ length: 52 }, (_, i) => `${prefix}${i + 1}`)
  })

  const chartOptions = computed(() => {
    if (!props.data || Object.keys(props.data).length === 0) return {}
    const isMonthly = props.granularity === 'month'
    const categories = isMonthly ? monthLabels.value : weekLabels.value
    //console.log('MixMerge chartOptions categories', props.data, categories)
    const years = Object.keys(props.data).sort()

    // Pre-compute totals per period
    const totalPerPeriod = Array(categories.length).fill(0)
    years.forEach((year) => {
      props.data[year].forEach((count, idx) => {
        totalPerPeriod[idx] += count
      })
    })

    const series = [
      // Total bar
      {
        name: t('dashboard.charts.total'),
        type: 'bar',
        data: totalPerPeriod,
        z: 1,
      },
      // One line per year
      ...years.map((year) => ({
        name: year,
        type: 'line',
        data: props.data[year],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        z: 2,
      })),
    ]

    return {
      backgroundColor: props.theme === 'dark' ? '#1f262f' : '',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: [t('dashboard.charts.total'), ...years],
        top: 5,
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: true,
        axisPointer: { type: 'shadow' },
        axisLabel: {
          rotate: isMonthly ? 0 : 45,
          interval: isMonthly ? 0 : 3,
        },
      },
      yAxis: {
        type: 'value',
        name: t('dashboard.charts.logEntries'),
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        axisLabel: { formatter: '{value}' },
      },
      series,
    }
  })

  const themeOption = computed(() => {
    return props.theme || THEME_KEY.LIGHT
  })
</script>

<style lang="scss" scoped>
  .time-series-chart {
    width: 100%;
  }

  #echarts {
    height: 400px;
  }
</style>
