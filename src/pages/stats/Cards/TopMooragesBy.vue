<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps({
    items: {
      type: Array,
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
</script>

<template>
  <va-card class="col-span-12 lg:col-span-6 p-2">
    <va-card-title class="flex justify-between">
      <h1 class="card-title text-secondary font-bold uppercase">{{ $props.title }}</h1>
    </va-card-title>
    <va-card-content class="flex flex-col gap-1">
      <va-data-table
        class="region-revenue-table"
        hide-default-header
        :columns="[{ key: 'name' }, { key: $props.columnvalue, align: 'right' }]"
        :items="$props.items"
      >
        <template #cell(name)="{ rowData }">
          <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
            {{ rowData.moorage }}
          </router-link>
        </template>
        <template #[`$props.columnvalue`]="{ rowData }"> {{ rowData[`$props.columnvalue`] }} </template>
      </va-data-table>
    </va-card-content>
  </va-card>
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
