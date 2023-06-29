<template>
  <Bubble :options="props.chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Bubble } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LinearScale,
    ChartData,
    ChartOptions,
  } from 'chart.js'
  ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale)

  const props = defineProps<{
    chartData: ChartData<'bubble'>
    chartOptions?: ChartOptions<'bubble'>
  }>()
</script>
