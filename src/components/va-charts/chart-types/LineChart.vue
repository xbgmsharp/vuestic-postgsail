<template>
  <Line :options="chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Line } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    Filler,
    ChartData,
    ChartOptions,
  } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler)

  const props = defineProps<{
    chartData: ChartData<'line'>
    chartOptions?: ChartOptions<'line'>
  }>()
</script>
