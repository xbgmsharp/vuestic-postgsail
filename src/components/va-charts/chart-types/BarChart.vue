<template>
  <Bar :options="props.chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    LineController,
    Filler,
    ChartData,
    ChartOptions,
  } from 'chart.js'

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    LineController,
    Filler,
  )

  const props = defineProps<{
    chartData: ChartData<'bar'>
    chartOptions?: ChartOptions<'bar'>
  }>()
</script>
