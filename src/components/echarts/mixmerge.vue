<template>
  <div class="time-series-chart">
    <div id="echarts">
      <v-chart :option="chartOptions" :theme="themeOption" autoresize />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart, BarChart } from 'echarts/charts'
  import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  use([LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

  const props = defineProps({
    logs: {
      type: Array,
      required: true,
      default: () => [],
    },
    granularity: {
      type: String,
      default: 'month',
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

  // Process logs by month
  const processMonthlyData = () => {
    const yearMonthMap = new Map()

    props.logs.forEach((log) => {
      if (!log.started) return
      const date = new Date(log.started)
      const year = date.getFullYear()
      const month = date.getMonth() // 0-11

      const key = `${year}-${month}`
      if (!yearMonthMap.has(key)) {
        yearMonthMap.set(key, { year, month, count: 0 })
      }
      yearMonthMap.get(key).count++
    })

    // Group by year
    const yearData = new Map()
    yearMonthMap.forEach(({ year, month, count }) => {
      if (!yearData.has(year)) {
        yearData.set(year, Array(12).fill(0))
      }
      yearData.get(year)[month] = count
    })

    return yearData
  }

  // Process logs by week
  const processWeeklyData = () => {
    const yearWeekMap = new Map()

    props.logs.forEach((log) => {
      if (!log.started) return
      const date = new Date(log.started)
      const year = date.getFullYear()
      const week = getWeekNumber(date)

      const key = `${year}-${week}`
      if (!yearWeekMap.has(key)) {
        yearWeekMap.set(key, { year, week, count: 0 })
      }
      yearWeekMap.get(key).count++
    })

    // Group by year
    const yearData = new Map()
    yearWeekMap.forEach(({ year, week, count }) => {
      if (!yearData.has(year)) {
        yearData.set(year, Array(53).fill(0)) // Max 53 weeks
      }
      yearData.get(year)[week - 1] = count
    })

    return yearData
  }

  // Get ISO week number
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  }

  // Chart options computed
  const chartOptions = computed(() => {
    const isMonthly = props.granularity === 'month'
    const yearData = isMonthly ? processMonthlyData() : processWeeklyData()
    const years = Array.from(yearData.keys()).sort()

    // X-axis categories
    const categories = isMonthly ? monthLabels.value : weekLabels.value

    // Calculate total per period (for bars)
    const totalPerPeriod = Array(categories.length).fill(0)
    yearData.forEach((data) => {
      data.forEach((count, idx) => {
        totalPerPeriod[idx] += count
      })
    })

    // Create series
    const series = [
      // Bar chart for totals
      {
        name: 'Total',
        type: 'bar',
        data: totalPerPeriod,
        /*
      itemStyle: {
        color: '#91cc75',
        opacity: 0.6
      },
      */
        z: 1,
      },
    ]

    // Line charts for each year
    const lineColors = ['#5470c6', '#ee6666', '#fac858', '#73c0de', '#3ba272']
    years.forEach((year, idx) => {
      series.push({
        name: year.toString(),
        type: 'line',
        data: yearData.get(year),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        /*
      lineStyle: {
        width: 2,
        color: lineColors[idx % lineColors.length]
      },
      itemStyle: {
        color: lineColors[idx % lineColors.length]
      },
      */
        z: 2,
      })
    })

    return {
      backgroundColor: props.theme === 'dark' ? '#1f262f' : '',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['Total', ...years.map((y) => y.toString())],
        top: 5,
        left: 'center',
        selected: {
          Total: true,
          ...Object.fromEntries(years.map((y) => [y.toString(), true])),
        },
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
          interval: isMonthly ? 0 : 3, // Show every 4th week label
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
      series: series,
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
