<script setup lang="ts">
  import { PropType } from 'vue'
  import { useI18n } from 'vue-i18n'
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

  const emit = defineEmits<{
    (event: 'updateDefaultStay', stayCode: number, id: number): void
  }>()

  const columns: Array<{ key: string; label: string; tdAlign?: 'left' | 'center' | 'right' }> = [
    { key: 'moorage', label: t('moorages.list.moorage') },
    { key: 'default_stay', label: t('moorages.list.default_stay') },
    { key: 'total_stay', label: t('moorages.list.total_stay'), tdAlign: 'right' },
    { key: 'arrivals_departures', label: t('moorages.list.arrivals'), tdAlign: 'right' },
  ]
</script>

<template>
  <va-data-table :columns="columns" :items="items" :loading="loading" striped hoverable>
    <template #cell(moorage)="{ value, rowData }">
      <div class="whitespace-normal break-words">
        <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
          {{ value }}
        </router-link>
      </div>
    </template>
    <template #cell(default_stay)="{ rowData }">
      <div v-if="rowData.default_stay_id">
        <StayAt
          :id="parseInt(rowData.id)"
          :key="rowData.id"
          :data="parseInt(rowData.default_stay_id)"
          @clickFromChildComponent="(code) => emit('updateDefaultStay', code, rowData.id)"
        />
      </div>
    </template>
    <template #cell(total_stay)="{ value, rowData }">
      <router-link class="va-link link" :to="{ name: 'moorage-stays', params: { id: rowData.id } }">
        {{ value }}
      </router-link>
    </template>
    <template #cell(arrivals_departures)="{ value, rowData }">
      <router-link class="va-link link" :to="{ name: 'moorage-arrivals-departures', params: { id: rowData.id } }">
        {{ value }}
      </router-link>
    </template>
  </va-data-table>
</template>
