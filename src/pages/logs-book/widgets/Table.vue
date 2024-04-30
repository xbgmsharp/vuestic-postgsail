<script setup lang="ts">
  import { PropType, computed } from 'vue'
  import { defineVaDataTableColumns } from 'vuestic-ui'
  import { useVModel } from '@vueuse/core'
  import { Log, Pagination } from '../types'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC } from '../../../utils/dateFormatter.js'
  import { useGlobalStore } from '../../../stores/global-store'
  const { isLoggedIn, publicVessel } = useGlobalStore()
  const { t } = useI18n()

  const sortFloat = (a, b) => parseFloat(a) - parseFloat(b)

  const columns = defineVaDataTableColumns([
    { label: t('logs.log.name'), key: 'name', sortable: true },
    { label: t('logs.list.from'), key: 'from', sortable: true },
    { label: t('logs.list.to'), key: 'to', sortable: true },
    { label: t('logs.list.from_time'), key: 'fromTime', sortable: true },
    { label: t('logs.list.to_time'), key: 'toTime', sortable: true },
    { label: t('logs.log.distance'), key: 'distance', sortable: true, sortingFn: sortFloat, tdAlign: 'right' },
    { label: t('logs.log.duration'), key: 'duration', sortable: true, sortingFn: sortFloat, tdAlign: 'right' },
    { label: ' ', key: 'actions' },
  ])

  const props = defineProps({
    logbook: {
      type: Array as PropType<Log[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    sortBy: {
      type: String,
      required: true,
    },
    sortingOrder: {
      type: String,
      required: true,
    },
    pagination: {
      type: Object as PropType<Pagination>,
      required: true,
    },
  })

  const emit = defineEmits<{
    (event: 'edit', log: Log): void
    (event: 'delete', log: Log): void
    (event: 'replay', log: Log): void
  }>()

  const sortByVModel = useVModel(props, 'sortBy', emit)
  const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

  const totalPages = computed(() => Math.ceil(props.logbook.length / props.pagination.perPage))
</script>

<template>
  <div>
    <VaDataTable
      :columns="columns"
      :items="logbook"
      :loading="loading"
      :per-page="props.pagination.perPage"
      :current-page="props.pagination.page"
      striped
      hoverable
    >
      <template #cell(name)="{ value, rowData }">
        <template v-if="isLoggedIn">
          <router-link class="va-link link" :to="{ name: 'log-details', params: { id: rowData.id } }">
            {{ value }}
          </router-link> </template
        ><template v-else>
          <router-link
            class="va-link link"
            :to="{ name: 'log-details', params: { boat: publicVessel, id: rowData.id } }"
          >
            {{ value }}
          </router-link>
        </template>
      </template>
      <template #cell(from)="{ value, rowData }">
        <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.fromMoorageId || 0 } }">
          {{ value }}
        </router-link>
      </template>
      <template #cell(to)="{ value, rowData }">
        <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.toMoorageId || 0 } }">
          {{ value }}
        </router-link>
      </template>
      <template #cell(fromTime)="{ value }">
        {{ dateFormatUTC(value) }}
      </template>
      <template #cell(toTime)="{ value }">
        {{ dateFormatUTC(value) }}
      </template>
      <template #cell(distance)="{ value }">
        {{ value }}
      </template>
      <template #cell(duration)="{ value }"> {{ value }} </template>
      <template #cell(actions)="{ rowData: log }">
        <div class="flex gap-2 justify-end">
          <va-dropdown class="">
            <template #anchor>
              <va-icon name="more_vert" />
            </template>
            <va-dropdown-content class="float-left">
              <div class="grid grid-cols-1">
                <VaButton preset="secondary" icon="edit" size="medium" color="secondary" @click="$emit('edit', log)">
                  Edit</VaButton
                >
              </div>
              <div class="grid grid-cols-1">
                <VaButton
                  preset="secondary"
                  icon="delete"
                  size="medium"
                  color="secondary"
                  @click="$emit('delete', log)"
                >
                  Delete</VaButton
                >
              </div>
              <div class="grid grid-cols-1">
                <VaButton
                  preset="secondary"
                  icon="timelapse"
                  size="medium"
                  color="secondary"
                  @click="$emit('replay', log)"
                >
                  Replay</VaButton
                >
              </div>
            </va-dropdown-content>
          </va-dropdown>
        </div>
        <!--
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            color="primary"
            icon="edit"
            aria-label="Edit trip"
            @click="$emit('edit', log as Log)"
          />
          <VaButton
            preset="primary"
            size="small"
            icon="delete"
            color="danger"
            aria-label="Delete trip"
            @click="$emit('delete', log as Log)"
          />
        </div>
        -->
      </template>
    </VaDataTable>
    <template v-if="logbook.length > $props.pagination.perPage">
      <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
        <div>
          <b>{{ logbook.length }} trips.</b>
          Logs per page
          <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 20, 50, 100]" />
        </div>
        <div class="mt-3 row justify-center">
          <VaPagination v-model="$props.pagination.page" input :pages="totalPages" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .va-data-table {
    ::v-deep(tbody .va-data-table__table-tr) {
      border-bottom: 1px solid var(--va-background-border);
    }
  }
</style>
