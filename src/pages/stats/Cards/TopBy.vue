<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps({
    items: {
      type: [],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    columnvalue: {
      type: String,
      required: true,
    },
  })

  const selectedPeriod = ref('#3')
  const periods = ['#3', '#5', '#10'].map((period) => ({ label: period, value: period }))
</script>

<template>
  <VaCard>
    <VaCardTitle class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">{{ $props.title }}</h1>
    </VaCardTitle>
    <VaCardContent class="flex flex-col gap-1">
      <!--
      <div class="flex justify-between">
        <VaButtonToggle v-model="selectedPeriod" :options="periods" color="background-element" size="small" />
      </div>
      -->

      <VaDataTable
        class="region-revenue-table"
        hide-default-header
        :columns="[{ key: 'name' }, { key: $props.columnvalue, align: 'right' }]"
        :items="$props.items"
      >
        <template #cell(name)="{ rowData }">
          <router-link class="va-link link" :to="{ name: 'log-map', params: { id: rowData.id } }">
            {{ rowData.name }}
          </router-link>
        </template>
        <template #[`$props.columnvalue`]="{ rowData }"> {{ rowData[`$props.columnvalue`] }} </template>
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
