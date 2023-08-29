<template>
  <PolarArea :options="chartOptions" :data="props.chartData" />
</template>

<script setup lang="ts">
  import { Chart as ChartJS, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js'
  import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

  ChartJS.register(MatrixController, MatrixElement)

  const props = defineProps<{
    chartData: null
    chartOptions?: null
  }>()
</script>
