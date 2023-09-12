<template>
  <div>
    <canvas ref="heatmapChartCanvas" :style="{ width: '100%' }"></canvas>
  </div>
</template>

<script setup>
  import { Chart, registerables } from 'chart.js'
  import 'chartjs-adapter-moment'
  import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'
  import moment from 'moment-timezone'
  import _ from 'lodash'
  import { default as dayOfWeek_month } from './library/data_dayOfWeek_month'
  import { ref, onMounted } from 'vue'

  Chart.register(...registerables)
  Chart.register(MatrixController, MatrixElement)
  Chart.defaults.animation.duration = 0
  Chart.defaults.transitions['active'].duration = 0
  Chart.defaults.transitions['resize'].duration = 0
  Chart.defaults.transitions['hide'].duration = 0
  Chart.defaults.transitions['show'].duration = 0
  Chart.defaults.elements.line.tension = 0
  Chart.defaults.devicePixelRatio = 2

  const heatmapChartCanvas = ref(null)
  const meter = 'd3097df1-5d92-4d9c-88de-eb8812cc8ef0'
  let xAxis = 'month'
  let yAxis = 'dayOfWeek'
  let data = dayOfWeek_month

  const config = {
    hour: getHours(),
    dayOfWeek: getDaysOfWeek(),
    month: getMonths(),
    dayOfYear: getDaysOfYear(),
    week: getWeeks(),
  }

  const yLabels = config[yAxis]
  const xLabels = config[xAxis]

  function getMaxByGroupyBy(isLeapYear) {
    return {
      hour: 24,
      dayOfWeek: 7,
      month: 12,
      dayOfYear: isLeapYear ? 366 : 365,
      week: 53,
    }
  }

  function getHours() {
    return [...Array(getMaxByGroupyBy().hour).keys()]
  }

  function getDaysOfWeek(localeName) {
    const [sunday, ...labels] = moment.localeData(localeName).weekdays()
    const weeks = [...labels, sunday].map(_.capitalize)
    return weeks
  }

  function getMonths(localeName) {
    return moment.localeData(localeName).months().map(_.capitalize)
  }

  function getDaysOfYear() {
    return [...Array(getMaxByGroupyBy().dayOfYear).keys()]
  }

  function getWeeks() {
    return [...Array(getMaxByGroupyBy().week).keys()].map((i) => i + 1)
  }

  function getValueFromDate(type, value) {
    // Rest of the function remains the same
    switch (type) {
      case 'hour':
        return moment(value).hour()
      case 'dayOfWeek':
        return moment(value).format('dddd')
      case 'month':
        return moment(value).format('MMMM')
      case 'dayOfYear':
        return moment(value).dayOfYear()
      case 'week':
        return moment(value).isoWeek()
      default:
        return ''
    }
  }

  function generateData(xAxisType, yAxisType) {
    // Rest of the function remains the same
    return data.map((point) => ({
      x: getValueFromDate(xAxisType, point.timestamp),
      y: getValueFromDate(yAxisType, point.timestamp),
      v: point[meter],
    }))
  }

  function getBackgroundColor(colors, value) {
    // Rest of the function remains the same
    if (value != null) {
      const subColors = colors.filter((c) => value < c.value)
      if (subColors.length === 0) {
        return colors[colors.length - 1].color
      } else {
        return subColors[0].color
      }
    }
    return 'lightgrey'
  }

  const colors = [
    { value: 2, color: '#abdbe3' },
    { value: 5, color: '#76b5c5' },
    { value: 20, color: '#1e81b0' },
    { value: 30, color: '#154c79' },
    { value: 40, color: '#063970' },
  ]

  const chartOptions = {
    type: 'matrix',
    data: {
      datasets: [
        {
          data: generateData(xAxis, yAxis),
          backgroundColor(ctx) {
            const value = ctx.dataset.data[ctx.dataIndex].v
            return getBackgroundColor(colors, value)
          },
          width(c) {
            const a = c.chart.chartArea || {}
            return (a.right - a.left) / xLabels.length - 1
          },
          height(c) {
            const a = c.chart.chartArea || {}
            return (a.bottom - a.top) / yLabels.length - 1
          },
        },
      ],
    },
    options: {
      scales: {
        y: {
          // y axis options
          type: 'category',
          reverse: false,
          offset: true,

          labels: yLabels,
          ticks: {
            autoSkip: true,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        x: {
          // x axis options
          type: 'category',
          offset: true,
          position: 'bottom',

          labels: xLabels,
          ticks: {
            autoSkip: true,
            maxRotation: 0,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
      plugins: {
        // plugins options
        legend: false,
        tooltip: {
          callbacks: {
            title() {
              return ''
            },
            label(context) {
              const v = context.dataset.data[context.dataIndex]
              return ['x: ' + v.x, 'y: ' + v.y, 'v: ' + v.v]
            },
          },
        },
      },
    },
  }

  let chart

  onMounted(() => {
    const ctx = heatmapChartCanvas.value.getContext('2d')
    chart = new Chart(ctx, chartOptions)
    console.log(ctx, 'ctx-202')
  })
</script>
