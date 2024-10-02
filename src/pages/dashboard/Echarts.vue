<template>
  <div class="charts">
    <div class="grid grid-cols-12 gap-6">
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsMix v-if="mixedChartDataComputed" :series="mixedChartDataComputed" />
        </va-card-content>
      </va-card>
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.HeatmapChart') }}</va-card-title>
        <va-card-content>
          <EchartsHeatmap v-if="HeatmapChartComputed" :series="HeatmapChartComputed" />
        </va-card-content>
      </va-card>
    </div>
    <!-- From stats -->
    <div class="dashboard flex flex-auto col-span-12 p-2 gap-4">
      <va-card class="flex-auto card-width">
        <va-card-title>{{ t('stats.logs') }}</va-card-title>
        <va-card-content style="width: 100%">
          <EchartsDonught v-if="pieChartUnderway" :series="pieChartUnderway" />
        </va-card-content>
      </va-card>
      <va-card class="flex-auto card-width">
        <va-card-title>{{ t('stats.moorages') }}</va-card-title>
        <va-card-content style="width: 100%">
          <EchartsDonught v-if="pieChartStayType" :series="pieChartStayType" />
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
  import { useI18n } from 'vue-i18n'
  import EchartsMix from '../../components/echarts/mix.vue'
  import EchartsDonught from '../../components/echarts/donught.vue'
  import EchartsHeatmap from '../../components/echarts/heatmap.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import moment from 'moment/min/moment-with-locales'
  import { useGlobalStore } from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { stats_logs, stats_moorages } = storeToRefs(GlobalStore)
  const { t } = useI18n()

  const CacheStore = useCacheStore()
  const { logs_by_month, logs_by_year_by_month, logs_by_month_by_weekday } = storeToRefs(CacheStore)
  const { logs, stays, moorages } = storeToRefs(CacheStore)
  console.log('echarts logs_by_month', logs_by_year_by_month.value)

  const series = [
    {
      name: 'Bar Dataset',
      type: 'bar',
      smooth: true,
      tooltip: {
        valueFormatter: function (value) {
          return value
        },
      },
      data: [1, 2, 4, 4, 3, 4, 0, 5, 1, 3, 0, 0],
    },
  ]
  const mixedChartDataComputed = computed(() => {
    if (logs_by_month.value.length == 0) return {}
    let mymixedChartData = [...series]
    mymixedChartData[0].data = logs_by_month.value
    mymixedChartData[0].name = 'Total'
    Object.entries(logs_by_year_by_month.value).forEach((elm, ind) => {
      const line = structuredClone({
        type: 'line',
        smooth: true,
      })
      line.name = elm[0]
      line.data = elm[1]
      mymixedChartData[ind + 1] = line
    })
    return mymixedChartData
  })
  const HeatmapChartComputed = computed(() => {
    let matrix_data = []
    if (logs_by_month_by_weekday.value.length != 0) {
      logs_by_month_by_weekday.value.forEach((elm, ind) => {
        matrix_data.push([elm.x, elm.y, elm.v])
      })
    }
    return matrix_data
  })
  const pieChartUnderway = computed(() => {
    if (!stats_logs.value || !stats_moorages.value) {
      return []
    }
    return [
      {
        value: moment.duration(stats_logs.value.sum_duration).as('days').toFixed(1),
        name: 'Underway',
      },
      {
        value: moment.duration(stats_moorages.value.time_spent_away).as('days').toFixed(1),
        name: 'Away',
      },
      {
        value: moment.duration(stats_moorages.value.time_at_home_ports).as('days').toFixed(1),
        name: 'Home',
      },
    ]
  })

  const timeSpentAwayByType = computed(() => {
    if (
      !stats_moorages.value ||
      !Array.isArray(stats_moorages.value.time_spent_away_arr) ||
      stats_moorages.value.time_spent_away_arr.length === 0
    ) {
      return {}
    }

    let totalDurationMs = 0
    const stayMap = {}

    stats_moorages.value.time_spent_away_arr.forEach((entry) => {
      const stayCode = entry.stay_code
      const durationMs = moment.duration(entry.stay_duration).asMilliseconds()

      totalDurationMs += durationMs
      if (!stayMap[stayCode]) {
        stayMap[stayCode] = { durationMs: 0 }
      }
      stayMap[stayCode].durationMs += durationMs
    })

    Object.keys(stayMap).forEach((stayCode) => {
      const durationMs = stayMap[stayCode].durationMs

      stayMap[stayCode].percentage = Math.round((durationMs / totalDurationMs) * 100)

      const durationObj = moment.duration(durationMs)
      stayMap[stayCode].duration = durationObj.toISOString()
    })

    return stayMap
  })

  const pieChartStayType = computed(() => {
    const timeData = timeSpentAwayByType.value
    const data = []
    Object.keys(timeData).forEach((stayCode) => {
      const value = timeData[stayCode]
      if (value.durationMs > 0) {
        data.push({
          value: moment.duration(value.duration).as('days').toFixed(1),
          name: t('id.stay_code.' + stayCode),
        })
      }
    })
    return data
  })
</script>

<style lang="scss">
  .dashboard {
    .va-icon {
      fill: var(--va-text-primary);
    }
    .va-card {
      margin-bottom: 0 !important;
      &__title {
        display: flex;
        justify-content: space-between;
      }
    }
    .card-width {
      width: 100%;
      @media (min-width: 768px) {
        width: calc((100% - 2rem) / 2);
      }
      @media (min-width: 1024px) {
        width: calc((100% - 2rem) / 3);
      }
    }
  }
</style>
