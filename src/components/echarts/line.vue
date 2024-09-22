<script setup>
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([GridComponent, LineChart, CanvasRenderer])

  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true,
      },
    ],
  }
</script>

<template>
  <div id="echarts">
    <v-chart :option="option" autoresize />
  </div>
</template>

<style lang="scss">
  #echarts {
    height: 400px;
  }
</style>
