<script setup>
  import { ref, computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import * as echarts from 'echarts/core'
  import { LineChart, CustomChart } from 'echarts/charts'
  import { GridComponent, LegendComponent, TooltipComponent, TitleComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { default as utils } from '../../utils/utils.js'

  echarts.use([
    GridComponent,
    LineChart,
    CustomChart,
    CanvasRenderer,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
  ])

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

  const seriesData = [
    ['2024-07-10 10:00', 12, 45],
    ['2024-07-10 11:00', 15, 90],
    ['2024-07-10 12:00', 8, 180],
    ['2024-07-10 13:00', 7, 90],
    ['2024-07-10 14:00', 10, 170],
    ['2024-07-10 15:00', 9, 90],
    ['2024-07-10 16:00', 10, 160],
    ['2024-07-10 17:00', 20, 120],
    ['2024-07-10 18:00', 25, 230],
  ]

  // convert speed m/s → barbs (approx: 1 barb per 5 knots)
  function buildWindBarb(speed, direction, x, y, api) {
    const knots = speed * 1.94384 // m/s → knots
    let remaining = Math.round(knots)

    const rad = ((direction - 90) * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    const shaftLength = 20
    const shaftX = x + cos * shaftLength
    const shaftY = y + sin * shaftLength

    let shapes = [
      {
        type: 'line',
        shape: { x1: x, y1: y, x2: shaftX, y2: shaftY },
        style: { stroke: '#333', lineWidth: 2 },
      },
    ]

    let pos = 0
    const spacing = 4
    const barbLen = 10

    // place from tip backwards
    while (remaining >= 50) {
      const px = shaftX - cos * pos
      const py = shaftY - sin * pos
      const tx = px - cos * barbLen + sin * barbLen
      const ty = py - sin * barbLen - cos * barbLen
      shapes.push({
        type: 'polygon',
        shape: {
          points: [
            [px, py],
            [tx, ty],
            [px, py - 0.1],
          ],
        },
        style: { fill: '#333' },
      })
      remaining -= 50
      pos += spacing * 2
    }

    while (remaining >= 10) {
      const px = shaftX - cos * pos
      const py = shaftY - sin * pos
      const tx = px + sin * barbLen
      const ty = py - cos * barbLen
      shapes.push({
        type: 'line',
        shape: { x1: px, y1: py, x2: tx, y2: ty },
        style: { stroke: '#333', lineWidth: 2 },
      })
      remaining -= 10
      pos += spacing
    }

    if (remaining >= 5) {
      const px = shaftX - cos * pos
      const py = shaftY - sin * pos
      const tx = px + sin * (barbLen * 0.5)
      const ty = py - cos * (barbLen * 0.5)
      shapes.push({
        type: 'line',
        shape: { x1: px, y1: py, x2: tx, y2: ty },
        style: { stroke: '#333', lineWidth: 2 },
      })
    }

    return { type: 'group', children: shapes }
  }

  const defaultConfig = ref({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const t = params[0].value[0]
        let html = `${dateFormatUTC(t)}<br/>`
        params.forEach((p) => {
          if (p.seriesType === 'line') {
            html += `Wind speed: ${Math.round(p.value[1] * 100) / 100} knots<br/>`
          } else if (p.seriesType === 'custom') {
            html += `Wind direction: ${Math.round(p.value[1])}° ${utils.deriveWindDir(p.value[1])}<br/>`
          }
        })
        return html
      },
    },
    legend: {
      data: [
        { name: 'Wind Speed', icon: 'circle' },
        { name: 'Wind Direction', icon: 'path://M0,0 L10,-5 L10,5 Z' }, // small arrow symbol
      ],
      //top: 20,
    },
    //grid: { left: 15, right: 15, top: 60, bottom: 40 },
    xAxis: { type: 'time' },
    yAxis: { axisLabel: { show: false } },
    series: [
      {
        type: 'line',
        name: 'Wind Speed',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        data: props.series.map((d) => [new Date(d[0]).getTime(), d[2]]),
      },
      {
        type: 'custom',
        name: 'Wind Direction',
        renderItem: (params, api) => {
          const xValue = api.value(0)
          const dir = api.value(1)
          const speed = api.value(2)
          const coord = api.coord([xValue, speed]) // align with line value
          return buildWindBarb(speed, dir, coord[0], coord[1], api)
        },
        encode: { x: 0, y: 2, tooltip: [1, 2] },
        data: props.series
          .map((d, i) => {
            // only keep 1 barb every N points
            const step = Math.ceil(props.series.length / 50) // ~50 barbs max
            return i % step === 0 ? [new Date(d[0]).getTime(), d[1], d[2]] : null
          })
          .filter(Boolean),
      },
    ],
  })

  const chartOptions = computed(() => {
    return defaultConfig.value
  })
  const themeOption = computed(() => {
    return props.theme || THEME_KEY.LIGHT
  })
</script>

<template>
  <div>
    <v-chart id="echarts" :option="chartOptions" :theme="themeOption" autoresize />
  </div>
</template>

<style lang="scss">
  #echarts {
    height: 400px;
  }
</style>
