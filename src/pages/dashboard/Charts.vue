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
      -->
      <va-card v-if="mixedChartDataComputed" class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <va-chart :data="mixedChartDataComputed" type="bar" />
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
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import VaChart from '../../components/va-charts/VaChart.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'

  const { t } = useI18n()

  const CacheStore = useCacheStore()
  const { data, logs_by_month, logs_by_year_by_month } = storeToRefs(CacheStore)
  const { barChart, lineChartbyYear } = CacheStore

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
        data: logs_by_month.value,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 1,
      },
    ],
  }

  //console.log(barChartData)

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

  //const bar = barChart()
  //const lines = lineChartbyYear()

  const mixedChartDataComputed = computed(() => {
    const mymixedChartData = mixedChartData
    mymixedChartData.datasets[0].data = logs_by_month.value
    mymixedChartData.datasets[0].label = 'Total'
    Object.entries(logs_by_year_by_month.value).forEach((elm) => {
      const line = structuredClone(dataset)
      line.label = elm[0]
      line.data = elm[1]
      line.borderColor = random_rgb_dark()
      line.backgroundColor = line.borderColor
      mymixedChartData.datasets.push(line)
    })
    return mymixedChartData
  })

  onMounted(async () => {
    console.log('onMounted! Charts')
  })

  watch(logs_by_month, () => {
    console.log('logs_by_month ref changed, do something!')
    console.log(logs_by_month.value)
  })

  watch(
    () => CacheStore.data.stats,
    () => {
      console.log('CacheStore state changed, do something!')
    },
  )
</script>

<style lang="scss">
  .chart-widget {
    .va-card__content {
      height: 450px;
    }
  }
</style>
