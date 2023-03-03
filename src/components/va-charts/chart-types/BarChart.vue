<template>
  <Bar :chart-options="chartOptions" :chart-data="props.chartData" />
</template>

<script setup lang="ts">
  import { Bar, Line } from 'vue-chartjs'
  import type { TChartOptions } from 'vue-chartjs/dist/types'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    LineController,
    Filler,
  } from 'chart.js'
  import { TBarChartData } from '../../../data/types'

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    Filler,
  )

  const props = defineProps<{
    chartData: TBarChartData
    chartOptions?: TChartOptions<'bar'>
  }>()
</script>
