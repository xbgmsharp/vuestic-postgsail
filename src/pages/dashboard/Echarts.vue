<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- mixedChart - Full width on all screens -->
    <va-card class="col-span-1 md:col-span-2">
      <va-card-title>
        {{ granularity === 'month' ? t('dashboard.charts.mixedMonthChart') : t('dashboard.charts.mixedWeekChart') }}
      </va-card-title>
      <template v-if="logs.length >= 1">
        <va-card-content>
          <div class="controls-row">
            <VaButtonToggle
              v-model="granularity"
              preset="primary"
              :options="[
                { label: t('dashboard.charts.byMonth'), value: 'month' },
                { label: t('dashboard.charts.byWeek'), value: 'week' },
              ]"
            />
          </div>
          <EchartsMix3
            v-if="BarChartComputed"
            :data="BarChartComputed"
            :granularity="granularity"
            :theme="currentTheme"
          />
        </va-card-content>
      </template>
      <template v-else>
        <va-card-content>{{ t('nodata.nodata') }}</va-card-content>
      </template>
    </va-card>

    <!-- HeatmapChart - Full width on all screens -->
    <va-card class="col-span-1 md:col-span-2">
      <va-card-title>{{ t('dashboard.charts.HeatmapChart') }}</va-card-title>
      <template v-if="logs.length >= 1">
        <va-card-content>
          <EchartsHeatmap v-if="HeatmapChartComputed" :series="HeatmapChartComputed" :theme="currentTheme" />
        </va-card-content>
      </template>
      <template v-else>
        <va-card-content>{{ t('nodata.nodata') }}</va-card-content>
      </template>
    </va-card>

    <!-- NetworkGraph - Full width on all screens -->
    <va-card class="col-span-1 md:col-span-2">
      <va-card-title>{{ t('dashboard.charts.NetworkGraph') }}</va-card-title>
      <template v-if="logs.length >= 1">
        <va-card-content>
          <div class="controls-row">
            <div class="control-group">
              <span class="control-label">{{ t('dashboard.charts.weightBy') }}:</span>
              <VaButtonGroup preset="primary">
                <VaButton
                  v-for="option in weightByOptions"
                  :key="option.value"
                  :color="weightBy === option.value ? 'primary' : 'secondary'"
                  @click="weightBy = option.value"
                >
                  {{ option.text }}
                </VaButton>
              </VaButtonGroup>
            </div>

            <VaDivider vertical class="hidden md:block" />

            <div class="control-group">
              <span class="control-label">{{ t('dashboard.charts.minTrips') }}:</span>
              <VaCounter v-model="minTrips" :min="1" :max="20" style="width: 120px" />
            </div>

            <VaDivider vertical class="hidden md:block" />

            <VaSwitch v-model="showLabels" :label="t('dashboard.charts.showLabels')" size="small" />
          </div>
          <EchartsGraph
            v-if="NetworkChartComputed.edges"
            :nodes="NetworkChartComputed.nodes"
            :edges="NetworkChartComputed.edges"
            :weight-by="weightBy"
            :min-trips="minTrips"
            :show-labels="showLabels"
            :theme="currentTheme"
          />
        </va-card-content>
      </template>
      <template v-else>
        <va-card-content>{{ t('nodata.nodata') }}</va-card-content>
      </template>
    </va-card>

    <!-- Pie Charts - Stack on mobile, side by side on desktop -->
    <va-card>
      <va-card-title>{{ t('stats.logs') }}</va-card-title>
      <va-card-content>
        <template v-if="hasLogs != 0">
          <EchartsDonught v-if="pieChartUnderway.length" :series="pieChartUnderway" :theme="currentTheme" />
        </template>
        <template v-else>
          {{ t('nodata.nodata') }}
        </template>
      </va-card-content>
    </va-card>

    <va-card>
      <va-card-title>{{ t('stats.moorages') }}</va-card-title>
      <va-card-content>
        <template v-if="hasLogs != 0">
          <EchartsDonught v-if="pieChartStayType.length" :series="pieChartStayType" :theme="currentTheme" />
        </template>
        <template v-else>
          {{ t('nodata.nodata') }}
        </template>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  //import EchartsMix from '../../components/echarts/mix.vue'
  //import EchartsMix2 from '../../components/echarts/mixmerge.vue'
  import EchartsMix3 from '../../components/echarts/mixmergelight.vue'
  //import EchartsSunburts from '../../components/echarts/sunburst.vue'
  import EchartsDonught from '../../components/echarts/donught.vue'
  import EchartsHeatmap from '../../components/echarts/heatmap.vue'
  import EchartsGraph from '../../components/echarts/seriesgraph.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { hasLogs, currentTheme, pieChartUnderway, pieChartStayType } = storeToRefs(GlobalStore)
  const { t } = useI18n()

  const CacheStore = useCacheStore()
  const { logs, moorages, stays, logs_by_month_by_weekday, logs_by_year_by_month, logs_by_year_by_week, logs_network } =
    storeToRefs(CacheStore)
  //console.log('echarts logs_by_year_by_month', logs_by_year_by_month.value)
  //console.log('echarts logs_by_month_by_weekday', logs_by_month_by_weekday.value)

  const granularity = ref('month')
  const showLabels = ref(true)
  const weightBy = ref('frequency')
  const minTrips = ref(1)
  const weightByOptions = computed(() => [
    { value: 'frequency', text: t('dashboard.charts.tripFrequency') },
    { value: 'distance', text: t('dashboard.charts.totalDistance') },
    { value: 'duration', text: t('dashboard.charts.totalDuration') },
  ])

  const BarChartComputed = computed(() =>
    granularity.value === 'month' ? logs_by_year_by_month.value : logs_by_year_by_week.value,
  )

  const HeatmapChartComputed = computed(() => {
    if (!logs_by_month_by_weekday.value?.length) return []

    const matrix_data = []
    logs_by_month_by_weekday.value.forEach((weekdayObj, monthIndex) => {
      Object.entries(weekdayObj).forEach(([weekday, value]) => {
        matrix_data.push([monthIndex, parseInt(weekday), value ?? 0])
      })
    })

    return matrix_data
  })

  const NetworkChartComputed = computed(() => {
    const { edges, nodes } = logs_network.value ?? {}
    if (!edges?.length) return { edges: [], nodes: [] }
    //console.log('NetworkChartComputed edges', edges.slice(0, 3))
    return { edges, nodes }
  })
</script>

<style scoped>
  .controls-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
    padding: 1rem;
    /*background-color: var(--va-background-element);*/
    border-radius: 0.5rem;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .control-label {
    font-weight: 600;
    white-space: nowrap;
  }

  /* Mobile specific */
  @media (max-width: 768px) {
    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }

    .control-group {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
