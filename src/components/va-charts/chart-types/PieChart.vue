<template>
  <Pie :options="chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Pie } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    ChartData,
    ChartOptions,
  } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

  const props = defineProps<{
    chartData: ChartData<'pie'>
    chartOptions?: ChartOptions<'pie'>
  }>()
</script>
