<template>
  <div>
    <canvas ref="heatmapChartCanvas" class="heatmapChartCanvas"></canvas>
  </div>
</template>

<script setup>
  // Using https://chartjs-chart-matrix.pages.dev/
  // Based on https://codesandbox.io/s/heat-map-modele-tache-5kdk2
  import { Chart as ChartJS, registerables } from 'chart.js'
  //import 'chartjs-adapter-moment'
  import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'
  import moment from 'moment'
  import _ from 'lodash'
  import { ref, onMounted } from 'vue'

  const props = defineProps({
    data: { type: Array, required: true },
  })

  ChartJS.register(...registerables)
  ChartJS.register(MatrixController, MatrixElement)
  ChartJS.defaults.animation.duration = 0
  ChartJS.defaults.transitions['active'].duration = 0
  ChartJS.defaults.transitions['resize'].duration = 0
  ChartJS.defaults.transitions['hide'].duration = 0
  ChartJS.defaults.transitions['show'].duration = 0
  ChartJS.defaults.elements.line.tension = 0
  ChartJS.defaults.devicePixelRatio = 2

  const heatmapChartCanvas = ref(null)
  let xAxis = 'month'
  let yAxis = 'dayOfWeek'

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
    { value: 0, color: '#87d9f7' },
    { value: 1, color: '#54b4d4' },
    { value: 2, color: '#4799b5' },
    { value: 3, color: '#3a7f97' },
    { value: 5, color: '#2d677a' },
    { value: 10, color: '#214f5e' },
    { value: 20, color: '#163844' },
    { value: 30, color: '#0b232b' },
  ]

  function updateChartOptions(chart) {
    if (window.innerWidth < 600) {
      chart.options.scales.y.ticks.display = false
    } else {
      chart.options.scales.y.ticks.display = true
    }
    chart.update()
  }

  let chart
  const chartOptions = {
    type: 'matrix',
    data: {
      datasets: [
        {
          data: props.data,
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
            display: true,
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
      responsive: true,
      maintainAspectRatio: false,
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
              return [v.x + ', ' + v.y + ': ' + v.v]
            },
          },
        },
      },
    },
  }

  onMounted(() => {
    const ctx = heatmapChartCanvas.value.getContext('2d')
    chart = new ChartJS(ctx, chartOptions)
    window.addEventListener('resize', function () {
      updateChartOptions(chart)
    })
    updateChartOptions(chart)
    //console.log(ctx, 'heatmapChartCanvas onMounted heatmapChartCanvas.value')
  })
</script>
