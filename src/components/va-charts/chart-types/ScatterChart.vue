<template>
  <Scatter :options="chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Scatter } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LinearScale,
    PointElement,
    LineElement,
    ChartData,
    ChartOptions,
  } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, LinearScale, PointElement, LineElement)

  const props = defineProps<{
    chartData: ChartData<'scatter'>
    chartOptions?: ChartOptions<'scatter'>
  }>()
</script>
