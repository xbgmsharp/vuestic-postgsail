<template>
  <div class="charts">
    <div class="grid grid-cols-12 gap-6">
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsMix />
        </va-card-content>
      </va-card>
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsPie />
        </va-card-content>
      </va-card>
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsLine />
        </va-card-content>
      </va-card>
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsDonught />
        </va-card-content>
      </va-card>
      <va-card class="chart-widget col-span-12">
        <va-card-title>{{ t('dashboard.charts.mixedChart') }}</va-card-title>
        <va-card-content>
          <EchartsHeatmap />
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
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
</script>

<style lang="scss"></style>
