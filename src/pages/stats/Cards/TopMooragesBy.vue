<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
  })

  const selectedPeriod = ref('#3')
  const periods = ['#3', '#5', '#10'].map((period) => ({ label: period, value: period }))

  const mooragesTopByStay = computed(() => {
    let mooragesTopByDuration = []
    if (!Array.isArray(props.items) || props.items.length == 0) return []
    mooragesTopByDuration = [...props.items]
    return mooragesTopByDuration
      .sort((a, b) => a.total_stay - b.total_stay)
      .reverse()
      .slice(0, 5)
  })

  const mooragesTopByArrivals = computed(() => {
    let mooragesTopByArrivals = []
    if (!Array.isArray(props.items) || props.items.length == 0) return []
    mooragesTopByArrivals = [...props.items]
    return mooragesTopByArrivals
      .sort((a, b) => a.arrivals_departures - b.arrivals_departures)
      .reverse()
      .slice(0, 5)
  })
</script>

<template>
  <VaCard>
    <VaCardTitle class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Top Moorages By total stays</h1>
    </VaCardTitle>
    <VaCardContent class="flex flex-col gap-4">
      <div class="flex justify-between">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" color="background-element" size="small" />
      </div>

      <VaDataTable
        class="region-revenue-table"
        :columns="[
          { key: 'moorage', label: t('moorages.list.moorage') },
          { key: 'total_stay', label: t('moorages.list.total_stay'), align: 'right' },
        ]"
        :items="mooragesTopByStay"
      >
        <template #cell(moorage)="{ rowData }">
          <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
            {{ rowData.moorage }}
          </router-link>
        </template>
        <template #cell(total_stay)="{ rowData }"> {{ rowData.total_stay }} </template>
      </VaDataTable>
    </VaCardContent>
  </VaCard>

  <VaCard>
    <VaCardTitle class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">Top Moorages By Arrivals</h1>
    </VaCardTitle>
    <VaCardContent class="flex flex-col gap-4">
      <div class="flex justify-between">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" color="background-element" size="small" />
      </div>

      <VaDataTable
        class="region-revenue-table"
        :columns="[
          { key: 'moorage', label: t('moorages.list.moorage') },
          { key: 'arrivals_departures', label: t('moorages.list.arrivals'), align: 'right' },
        ]"
        :items="mooragesTopByArrivals"
      >
        <template #cell(moorage)="{ rowData }">
          <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
            {{ rowData.moorage }}
          </router-link>
        </template>
        <template #cell(arrivals_departures)="{ rowData }"> {{ rowData.arrivals_departures }} </template>
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
