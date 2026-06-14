<script setup lang="ts">
  import { PropType } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC } from '../../../utils/dateFormatter.js'
  import StayAt from '../../../components/SelectStayAt.vue'

  const { t } = useI18n()

  defineProps({
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  })

  defineEmits<{
    (event: 'updateStayedAt', stayCode: number, id: number): void
  }>()

  const columns: Array<{ key: string; label: string; sortable?: boolean; tdAlign?: 'left' | 'center' | 'right' }> = [
    { key: 'name', label: t('stays.stay.name'), sortable: true },
    { key: 'moorage', label: t('stays.stay.moorage'), sortable: true },
    { key: 'arrived', label: t('stays.stay.arrived'), sortable: true },
    { key: 'departed', label: t('stays.stay.departed'), sortable: true },
    { key: 'stayed_at', label: t('stays.stay.stayed_at'), sortable: true },
    { key: 'duration', label: t('stays.stay.duration_d'), sortable: true, tdAlign: 'right' },
  ]
</script>

<template>
  <va-data-table :columns="columns" :items="items" :loading="loading" striped hoverable class="datatable">
    <template #cell(name)="{ value, rowData }">
      <div class="whitespace-normal break-words">
        <router-link
          v-if="value && rowData.id"
          class="va-link link"
          :to="{ name: 'stay-details', params: { id: rowData.id } }"
        >
          {{ value }}
        </router-link>
        <span v-else>{{ value }}</span>
      </div>
    </template>
    <template #cell(moorage)="{ value, rowData }">
      <div class="whitespace-normal break-words">
        <router-link
          v-if="value && rowData.moorage_id"
          class="va-link link"
          :to="{ name: 'moorage-details', params: { id: rowData.moorage_id } }"
        >
          {{ value }}
        </router-link>
        <span v-else>{{ value }}</span>
      </div>
    </template>
    <template #cell(arrived)="{ value, rowData }">
      <div class="whitespace-normal break-words">
        <router-link
          v-if="value && rowData.departed_log_id"
          class="va-link link"
          :to="{ name: 'log-map', params: { id: rowData.departed_log_id } }"
        >
          {{ dateFormatUTC(value) }}
        </router-link>
        <span v-else>{{ dateFormatUTC(value) }}</span>
      </div>
    </template>
    <template #cell(departed)="{ value, rowData }">
      <div class="whitespace-normal break-words">
        <router-link
          v-if="value && rowData.arrived_log_id"
          class="va-link link"
          :to="{ name: 'log-map', params: { id: rowData.arrived_log_id } }"
        >
          {{ dateFormatUTC(value) }}
        </router-link>
        <span v-else>{{ dateFormatUTC(value) }}</span>
      </div>
    </template>
    <template #cell(stayed_at)="{ rowData }">
      <div v-if="rowData.stayed_at_id">
        <StayAt
          :id="parseInt(rowData.id)"
          :key="rowData.id"
          :data="parseInt(rowData.stayed_at_id)"
          @clickFromChildComponent="(code) => $emit('updateStayedAt', code, rowData.id)"
        />
      </div>
      <span v-else>{{ rowData.stayed_at }}</span>
    </template>
    <template #cell(duration)="{ value }">
      {{ value }}
    </template>
  </va-data-table>
</template>

<style lang="scss" scoped>
  .va-data-table {
    overflow-x: auto;
  }
</style>
