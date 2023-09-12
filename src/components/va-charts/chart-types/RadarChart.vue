<template>
  <Radar :options="chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    ArcElement,
    ChartData,
    ChartOptions,
  } from 'chart.js'
  import { Radar } from 'vue-chartjs'

  ChartJS.register(Title, Tooltip, Legend, ArcElement, RadialLinearScale, ArcElement)

  const props = defineProps<{
    chartData: ChartData<'radar'>
    chartOptions?: ChartOptions<'radar'>
  }>()
</script>
