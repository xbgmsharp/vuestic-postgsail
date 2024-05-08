<template>
  <div class="charts">
    <div class="grid grid-cols-12 gap-6">
      <!--
      <va-card v-if="barChartDataGenerated" class="chart-widget md:col-span-6 col-span-12">
        <va-card-title>{{ t('charts.verticalBarChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="barChartDataGenerated" type="bar" />
        </va-card-content>
      </va-card>
      <va-card v-if="horizontalBarChartDataGenerated" class="chart-widget md:col-span-6 col-span-12">
        <va-card-title>{{ t('charts.horizontalBarChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="horizontalBarChartDataGenerated" type="horizontal-bar" />
        </va-card-content>
      </va-card>
      <va-card v-if="barChartDataComputed" class="chart-widget col-span-12">
        <va-card-title>{{ t('charts.horizontalBarChart') }}</va-card-title>
        <va-card-content>
          <va-chart v-if="barChartDataComputed" :data="barChartDataComputed" type="horizontal-bar" />
        </va-card-content>
      </va-card>
       -->
      <va-card v-if="mixedChartDataComputed" class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <va-chart v-if="mixedChartDataComputed" :data="mixedChartDataComputed" type="bar" />
        </va-card-content>
      </va-card>
      <!--
      <va-card class="chart-widget md:col-span-6 col-span-12">
        <va-card-title>{{ t('charts.RadarChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="radarChartData" type="radar" :options="ChartDataOptions" />
        </va-card-content>
      </va-card>
      <va-card class="chart-widget md:col-span-6 col-span-12">
        <va-card-title>{{ t('charts.donutChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="doughnutChartDataGenerated" type="doughnut" :options="doughnutChartDataOptions" />
        </va-card-content>
      </va-card>
      -->
      <va-card v-if="HeatmapChartComputed" class="heatmap-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.HeatmapChart') }}</va-card-title>
        <va-card-content>
          <HeatmapChart v-if="HeatmapChartComputed" :data="HeatmapChartComputed" />
        </va-card-content>
      </va-card>
      <!--
      <va-card v-if="pieChartDataGenerated" class="chart-widget md:col-span-6 col-span-12">
        <va-card-title>{{ t('charts.pieChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="pieChartDataGenerated" type="pie" />
        </va-card-content>
      </va-card>

      <va-card v-if="doughnutChartDataGenerated" class="chart-widget md:col-span-6 col-span-12">
        <va-card-title>{{ t('charts.donutChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="doughnutChartDataGenerated" type="doughnut" />
        </va-card-content>
      </va-card>

      <va-card v-if="bubbleChartDataGenerated" class="chart-widget col-span-12">
        <va-card-title>{{ t('charts.bubbleChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="bubbleChartDataGenerated" type="bubble" />
        </va-card-content>
      </va-card>
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
  import { useI18n } from 'vue-i18n'
  import VaChart from '../../components/va-charts/VaChart.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  //import HeatmapChart from '../../components/va-charts/chart-types/HeatmapChart.vue'
  const HeatmapChart = defineAsyncComponent(() => import('../../components/va-charts/chart-types/HeatmapChart.vue'))

  const { t } = useI18n()

  const CacheStore = useCacheStore()
  const { getAPI, logs_by_month, logs_by_year_by_month, logs_by_month_by_weekday } = storeToRefs(CacheStore)
  //const { barChart, lineChartbyYear, matrixChartbyMonthDay } = CacheStore

  // horizontal-bar chart Data
  /*
  const barChartData = {
    labels: [
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
    datasets: [
      {
        label: 'logs',
        data: [62, 10, 3, 1, 7, 5, 17, 6, 6, 4, 9, 25],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 1,
      },
    ],
  }
  console.log(logs_by_month.value, 'logs_by_months')
  const barChartDataComputed = computed(() => {
    let mybarChartData = structuredClone(barChartData)
    mybarChartData.datasets[0].data = logs_by_month.value
    mybarChartData.datasets[0].label = 'logs'

    console.log(mybarChartData.datasets[0].data, 'chartdata')
    return mybarChartData
  })
  */

  // radarChartData
  /*
  const radarChartData = {
    labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [65, 59, 90, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'My Second Dataset',
        data: [28, 48, 40, 19, 96, 27, 100],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
      },
    ],
  }
  const ChartDataOptions: any = {
    legend: {
      display: false,
    },
  }
  */

  // doughnutChartData
  /*
  const doughnutChartDataGenerated = {
    labels: ['Red', 'Orange', 'Green'],
    datasets: [
      {
        label: '# of Votes',
        data: [33, 33, 33],
        backgroundColor: ['rgba(231, 76, 60, 1)', 'rgba(255, 164, 46, 1)', 'rgba(46, 204, 113, 1)'],
        borderColor: ['rgba(255, 255, 255 ,1)', 'rgba(255, 255, 255 ,1)', 'rgba(255, 255, 255 ,1)'],
        borderWidth: 3,
      },
    ],
  }
  const doughnutChartDataOptions: any = {
    rotation: -90,
    circumference: 180,
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
    cutoutPercentage: 50,
  }
  */

  // mixedChartData
  const mixedChartData = {
    labels: [
      t('dashboard.months.january'),
      t('dashboard.months.february'),
      t('dashboard.months.march'),
      t('dashboard.months.april'),
      t('dashboard.months.may'),
      t('dashboard.months.june'),
      t('dashboard.months.july'),
      t('dashboard.months.august'),
      t('dashboard.months.september'),
      t('dashboard.months.october'),
      t('dashboard.months.november'),
      t('dashboard.months.december'),
    ],
    datasets: [
      {
        label: 'Bar Dataset',
        //label: 'Total',
        data: [62, 10, 3, 1, 7, 5, 17, 6, 6, 4, 9, 25],
        //data: logs_by_month.value,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      /*
      {
        type: 'line',
        label: 'Line Dataset',
        data: [12, 5, 3, 1, 7, 5, 17, 6, 6, 4, 8, 15],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
      },
      */
    ],
  }

  function random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')'
  }

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')'
  }

  const dataset = {
    type: 'line',
    label: 'Line Dataset',
    data: [62, 10, 3, 1, 7, 5, 17, 6, 6, 4, 9, 25],
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    fill: false,
  }

  const HeatmapChartComputed = computed(() => {
    let matrix_data = null
    if (logs_by_month_by_weekday.value.length != 0) {
      matrix_data = logs_by_month_by_weekday.value
    }
    return matrix_data
  })

  const mixedChartDataComputed = computed(() => {
    let mymixedChartData = structuredClone(mixedChartData)
    mymixedChartData.datasets[0].data = logs_by_month.value
    mymixedChartData.datasets[0].label = 'Total'
    Object.entries(logs_by_year_by_month.value).forEach((elm, ind) => {
      const line = structuredClone(dataset)
      line.label = elm[0]
      line.data = elm[1] as number[]
      line.borderColor = random_rgb_dark()
      line.backgroundColor = line.borderColor
      mymixedChartData.datasets[ind + 1] = line
    })
    return mymixedChartData
  })
  /*
  onMounted(async () => {
    console.log('onMounted! Charts')
  })
  watch(logs_by_month, () => {
    console.log('logs_by_month ref changed, do something!')
    console.log(logs_by_month.value)
  })
  watch(logs_by_year_by_month, () => {
    console.log('logs_by_year_by_month ref changed, update graph!')
    console.log(logs_by_year_by_month.value)
  })
  watch(
    () => CacheStore.stats,
    () => {
      console.log('CacheStore state changed, do something!')
    },
  )
*/
</script>

<style lang="scss">
  .chart-widget {
    .va-card__content {
      height: 450px;
    }
  }
  .heatmap-widget {
    .va-card__content {
      width: 100%;
    }
  }
</style>
