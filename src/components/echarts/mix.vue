<script setup>
  import VChart, { THEME_KEY } from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart, LineChart } from 'echarts/charts'
  import { TooltipComponent, ToolboxComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([TooltipComponent, ToolboxComponent, LegendComponent, GridComponent, BarChart, LineChart, CanvasRenderer])

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      data: ['Evaporation', 'Precipitation', 'Temperature'],
    },
    xAxis: [
      {
        type: 'category',
        data: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        axisPointer: {
          type: 'shadow',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Log entry',
        min: 0,
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    series: [
      {
        name: 'logs',
        type: 'bar',
        tooltip: {
          valueFormatter: function (value) {
            return value
          },
        },
        data: [4, 6, 7, 4, 5, 5, 17, 6, 6, 4, 2, 2],
      },
      {
        name: 'log 2021',
        type: 'line',
        smooth: true,
        tooltip: {
          valueFormatter: function (value) {
            return value
          },
        },
        data: [0, 0, 0, 0, 5, 5, 17, 6, 6, 4, 2, 2],
      },
      {
        name: 'log 2022',
        type: 'line',
        smooth: true,
        tooltip: {
          valueFormatter: function (value) {
            return value
          },
        },
        data: [3, 4, 3, 0, 8, 12, 26, 12, 4, 3, 3, 3],
      },
      {
        name: 'log 2023',
        type: 'line',
        smooth: true,
        tooltip: {
          valueFormatter: function (value) {
            return value
          },
        },
        data: [1, 2, 4, 4, 3, 4, 0, 5, 1, 3, 0, 0],
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
