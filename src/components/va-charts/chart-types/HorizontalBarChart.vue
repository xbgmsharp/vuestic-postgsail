<template>
  <Bar :options="{ ...chartOptions, ...horizontalBarOptions }" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    LinearScale,
    CategoryScale,
    ChartData,
    ChartOptions,
  } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale)

  const horizontalBarOptions = {
    indexAxis: 'y' as 'x' | 'y',
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
  }

  const props = defineProps<{
    chartData: ChartData<'bar'>
    chartOptions?: ChartOptions<'bar'>
  }>()
</script>
