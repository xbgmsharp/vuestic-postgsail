<template>
  <component :is="chartComponent" ref="chart" class="va-chart" :chart-options="chartOptions" :chart-data="props.data" />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { defaultConfig, chartTypesMap } from './VaChartConfigs'
  import { ChartData, ChartOptions } from 'chart.js'

  const props = defineProps<{
    data: ChartData<'line', number[], unknown>
    options?: ChartOptions<'line' | 'bar' | 'bubble' | 'doughnut' | 'pie' | 'scatter'>
    type: keyof typeof chartTypesMap
  }>()

  const chart = ref()

  const chartComponent = computed(() => chartTypesMap[props.type])

  const chartOptions = computed(() => ({
    ...defaultConfig,
    ...props.options,
  }))
</script>

<style lang="scss">
  .va-chart {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    > * {
      height: 100%;
      width: 100%;
    }

    canvas {
      width: 100%;
      height: auto;
      min-height: 320px;
    }
  }
</style>
