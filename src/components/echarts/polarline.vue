<script setup>
  import { ref, computed } from 'vue'
  import VChart, { THEME_KEY } from 'vue-echarts'
  import * as echarts from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, LegendComponent, TooltipComponent, TitleComponent } from 'echarts/components'

  echarts.use([GridComponent, LineChart, LegendComponent, TooltipComponent, TitleComponent])

  const props = defineProps({
    polarcsv: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      default: THEME_KEY.LIGHT,
    },
  })

  const CSV_PREAMBLE = 'twa/tws'
  const parseCSV = (csv) => {
    csv = csv.trim()

    if (csv.indexOf(CSV_PREAMBLE) !== 0) {
      console.error('CSV should start with ' + CSV_PREAMBLE)
      throw new Error('Invalid CSV')
    }
    const rows = csv
      .trim()
      .split('\n')
      .map((row) => row.split(';').map(Number.isNaN ? (val) => val : Number))
    const headers = rows[0]
    const twsLabels = headers.slice(1).map(Number)
    const rawData = rows.slice(1).map((row) => row.map(Number))
    return { twsLabels, rawData }
  }

  const buildSeries = (twsLabels, rawData) => {
    return twsLabels.map((tws, i) => ({
      name: `${tws} kt`,
      type: 'line',
      smooth: true,
      showSymbol: true,
      data: rawData.filter((row) => row[i + 1] !== 0).map((row) => [row[0], row[i + 1]]),
      emphasis: {
        focus: 'series',
      },
    }))
  }

  const defaultConfig = ref({
    title: {
      text: 'Sailing Polar Diagram (Line)',
      left: 'center',
      show: false,
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) =>
        `TWA: ${params.value[0]}°<br>Boat Speed: ${params.value[1]} kn<br>TWS: ${params.seriesName}`,
    },
    legend: {
      top: 'bottom',
    },
    xAxis: {
      //name: 'TWA (°)',
      type: 'value',
      min: 0,
      max: 180,
    },
    yAxis: {
      //name: 'Boat Speed (kn)',
      type: 'value',
    },
  })

  const chartOptions = computed(() => {
    //console.log(props.polarcsv)
    const { twsLabels, rawData } = parseCSV(props.polarcsv)
    let myChart = defaultConfig.value
    myChart.series = buildSeries(twsLabels, rawData)
    return myChart
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
