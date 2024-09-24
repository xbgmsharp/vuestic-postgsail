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
    <div class="dashboard flex flex-wrap col-span-12 p-2 gap-4">
      <va-card class="flex card-width">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsDonught />
        </va-card-content>
      </va-card>
      <va-card class="flex card-width">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsDonught />
        </va-card-content>
      </va-card>
    </div>
    <!-- For logbook details -->
    <va-card class="chart-widget col-span-12">
      <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
      <va-card-content>
        <EchartsLine />
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, defineAsyncComponent, PropType } from 'vue'
  import { useI18n } from 'vue-i18n'
  import EchartsMix from '../../components/echarts/mix.vue'
  import EchartsPie from '../../components/echarts/pie.vue'
  import EchartsLine from '../../components/echarts/line.vue'
  import EchartsDonught from '../../components/echarts/donught.vue'
  import EchartsHeatmap from '../../components/echarts/heatmap.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'

  const { t } = useI18n()

  const CacheStore = useCacheStore()
  const { getAPI, logs_by_month, logs_by_year_by_month, logs_by_month_by_weekday } = storeToRefs(CacheStore)
  console.log('echarts logs_by_month', logs_by_year_by_month.value)

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')'
  }

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
      line.data = elm[1] as number[]
      line.borderColor = random_rgb_dark()
      line.backgroundColor = line.borderColor
      mymixedChartData[ind + 1] = line
    })
    return mymixedChartData
  })
  const HeatmapChartComputed = computed(() => {
    let matrix_data = null
    if (logs_by_month_by_weekday.value.length != 0) {
      matrix_data = logs_by_month_by_weekday.value
    }
    return matrix_data
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
