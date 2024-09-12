<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { distanceFormat } from '../../../utils/distanceFormatter.js'
  import { durationFormatHours } from '../../../utils/dateFormatter.js'

  const { t } = useI18n()
  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
  })

  const selectedPeriod = ref('#3')
  const periods = ['#3', '#5', '#10'].map((period) => ({ label: period, value: period }))

  const logsTopByDistance = computed(() => {
    let logsTopByDistance = []
    if (!Array.isArray(props.items) || props.items.length == 0) return []
    logsTopByDistance = [...props.items]
    return logsTopByDistance
      .sort((a, b) => a.distance - b.distance)
      .reverse()
      .slice(0, 5)
  })

  const logsTopByDuration = computed(() => {
    let logsTopByDuration = []
    if (!Array.isArray(props.items) || props.items.length == 0) return []
    logsTopByDuration = [...props.items]
    return logsTopByDuration
      .sort((a, b) => a.duration - b.duration)
      .reverse()
      .slice(0, 5)
  })
</script>

<template>
  <VaCard>
    <VaCardTitle class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Top Logs By Distance</h1>
    </VaCardTitle>
    <VaCardContent v-if="logsTopByDistance" class="flex flex-col gap-1">
      <div class="flex justify-between">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" color="background-element" size="small" />
      </div>

      <VaDataTable
        class="region-revenue-table"
        :columns="[
          { key: 'name', label: t('logs.log.name') },
          { key: 'distance', label: t('logs.log.distance_nm'), align: 'right' },
        ]"
        :items="logsTopByDistance"
      >
        <template #cell(name)="{ rowData }">
          <router-link class="va-link link" :to="{ name: 'log-map', params: { id: rowData.id } }">
            {{ rowData.name }}
          </router-link>
        </template>
        <template #cell(distance)="{ rowData }"> {{ distanceFormat(rowData.distance) }} </template>
      </VaDataTable>
    </VaCardContent>
  </VaCard>

  <VaCard>
    <VaCardTitle class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Top Logs By Duration</h1>
    </VaCardTitle>
    <VaCardContent v-if="logsTopByDuration" class="flex flex-col gap-1">
      <div class="flex justify-between">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" color="background-element" size="small" />
      </div>

      <VaDataTable
        class="region-revenue-table"
        :columns="[
          { key: 'name', label: t('logs.log.name') },
          { key: 'duration', label: t('logs.log.duration_h'), align: 'right' },
        ]"
        :items="logsTopByDuration"
      >
        <template #cell(name)="{ rowData }">
          <router-link class="va-link link" :to="{ name: 'log-map', params: { id: rowData.id } }">
            {{ rowData.name }}
          </router-link>
        </template>
        <template #cell(duration)="{ rowData }"> {{ durationFormatHours(rowData.duration) }} </template>
      </VaDataTable>
    </VaCardContent>
  </VaCard>
</template>

<style lang="scss" scoped>
  .region-revenue-table {
    ::v-deep(tbody) {
      tr {
        border-top: 1px solid var(--va-background-border);
      }
    }
  }
</style>
