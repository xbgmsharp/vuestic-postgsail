<template>
  <div class="charts">
    <div class="row">
      <div class="flex md12 xs12">
        <va-card v-if="barChartData" class="chart-widget">
          <va-card-title>{{ t('dashboard.charts.verticalBarChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="barChartData" type="bar" />
          </va-card-content>
        </va-card>
      </div>
    </div>
    <!--
    <div class="row">
      <div class="flex md12 xs12">
        <va-card v-if="mixedChartData" class="chart-widget">
          <va-card-title>{{ t('dashboard.charts.verticalBarChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="mixedChartData" type="bar" />
          </va-card-content>
        </va-card>
      </div>
    </div>
    -->
    <!--
    <div class="row row-equal">
      <div class="flex xl6 xs12 lg6">
        <va-card v-if="barChartData" class="chart-widget">
          <va-card-title>{{ t('dashboard.charts.verticalBarChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="barChartData" type="bar" />
          </va-card-content>
        </va-card>
      </div>
      -->
    <!--
      <div class="flex xl6 xs12 lg6">
        <va-card v-if="horizontalBarChartDataGenerated" class="chart-widget">
          <va-card-title>{{ t('dashboard.charts.horizontalBarChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="horizontalBarChartDataGenerated" type="horizontal-bar" />
          </va-card-content>
        </va-card>
      </div>
      -->
    <!--
      <div class="flex xl6 xs12 lg6">
        <va-card v-if="barChartData" class="chart-widget">
          <va-card-title>{{ t('dashboard.charts.lineChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="barChartData" type="line" />
          </va-card-content>
        </va-card>
      </div>
    </div>
    -->
    <!--
    <div class="row">
      <div class="flex md12 xs12">
        <va-card v-if="lineChartDataGenerated" class="chart-widget">
          <va-card-title>{{ t('charts.lineChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="lineChartDataGenerated" type="line" />
          </va-card-content>
        </va-card>
      </div>
    </div>
-->
    <!--
    <div class="row">
      <div class="flex md6 xs12">
        <va-card v-if="pieChartDataGenerated" class="chart-widget">
          <va-card-title>{{ t('charts.pieChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="pieChartDataGenerated" type="pie" />
          </va-card-content>
        </va-card>
      </div>

      <div class="flex md6 xs12">
        <va-card v-if="doughnutChartDataGenerated" class="chart-widget">
          <va-card-title>{{ t('charts.donutChart') }}</va-card-title>
          <va-card-content>
            <va-chart :data="doughnutChartDataGenerated" type="doughnut" />
          </va-card-content>
        </va-card>
      </div>
    </div>
  --></div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import VaChart from '../../components/va-charts/VaChart.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'

  const { t } = useI18n()

  const CacheStore = useCacheStore()
  const { data, logs_by_month } = storeToRefs(CacheStore)
  const { barChart } = CacheStore

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
  //const barChartDataGenerated = useChartData(barChartData)

  const mixedChartData = {
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
        label: 'Bar Dataset',
        data: [62, 10, 3, 1, 7, 5, 17, 6, 6, 4, 9, 25],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        type: 'line',
        label: 'Line Dataset',
        data: [12, 5, 3, 1, 7, 5, 17, 6, 6, 4, 8, 15],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
      },
    ],
  }

  onMounted(async () => {
    console.log('onMounted!')
    barChart()
    console.log(logs_by_month.value)
    console.log(data.value.stats)
    //barChartData.datasets.data = data.value.stats
  })

  watch(logs_by_month, () => {
    console.log('logs_by_month ref changed, do something!')
    console.log(logs_by_month.value)
    //barChartData.datasets.data = data.value.stats
  })

  watch(
    () => CacheStore.data.stats,
    () => {
      console.log('CacheStore state changed, do something!')
      //barChartData.datasets.data = data.value.stats
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
