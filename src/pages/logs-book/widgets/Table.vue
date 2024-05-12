<script setup lang="ts">
  import { PropType, computed } from 'vue'
  import { defineVaDataTableColumns } from 'vuestic-ui'
  import { useVModel } from '@vueuse/core'
  import { Log, Pagination } from '../types'
  import TagsChip from '../../../components/TagsChip.vue'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC } from '../../../utils/dateFormatter.js'
  import { default as utils } from '../../../utils/utils.js'
  import { useGlobalStore } from '../../../stores/global-store'
  const { isLoggedIn, publicVessel } = useGlobalStore()
  const { t } = useI18n()

  const columns = defineVaDataTableColumns([
    { label: t('logs.log.name'), key: 'name', sortable: true },
    { label: t('logs.list.from'), key: 'from', sortable: true },
    { label: t('logs.list.to'), key: 'to', sortable: true },
    { label: t('logs.list.tags'), key: 'tags', sortable: true },
    { label: t('logs.list.from_time'), key: 'fromTime', sortable: true },
    { label: t('logs.list.to_time'), key: 'toTime', sortable: true },
    {
      label: t('logs.log.distance_nm'),
      key: 'distance_nm',
      sortable: true,
      sortingFn: utils.sortNum,
      tdAlign: 'right',
    },
    { label: t('logs.log.duration_h'), key: 'duration_h', sortable: true, sortingFn: utils.sortNum, tdAlign: 'right' },
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
    <va-data-table
      :columns="columns"
      :items="logbook"
      :loading="loading"
      :per-page="props.pagination.perPage"
      :current-page="props.pagination.page"
      striped
      hoverable
    >
      <template #cell(name)="{ value, rowData }">
        <div class="whitespace-normal break-words">
          <template v-if="isLoggedIn">
            <router-link class="va-link link" :to="{ name: 'log-map', params: { id: rowData.id } }">
              {{ value }}
            </router-link> </template
          ><template v-else>
            <router-link class="va-link link" :to="{ name: 'log-map', params: { boat: publicVessel, id: rowData.id } }">
              {{ value }}
            </router-link>
          </template>
        </div>
      </template>
      <template #cell(from)="{ value, rowData }">
        <div class="whitespace-normal break-words">
          <router-link
            class="va-link link"
            :to="{ name: 'moorage-details', params: { id: rowData.fromMoorageId || 0 } }"
          >
            {{ value }}
          </router-link>
        </div>
      </template>
      <template #cell(to)="{ value, rowData }">
        <div class="whitespace-normal break-words">
          <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.toMoorageId || 0 } }">
            {{ value }}
          </router-link>
        </div>
      </template>
      <template #cell(tags)="{ rowData }">
        <template v-if="rowData.tags">
          <tags-chip :key="rowData.id" :tags="rowData.tags" :max-show="2" />
        </template>
        <template v-else> </template>
      </template>
      <template #cell(fromTime)="{ value }">
        <div class="whitespace-normal break-words">
          {{ dateFormatUTC(value) }}
        </div>
      </template>
      <template #cell(toTime)="{ value }">
        <div class="whitespace-normal break-words">
          {{ dateFormatUTC(value) }}
        </div>
      </template>
      <template #cell(distance_nm)="{ value }">
        {{ value }}
      </template>
      <template #cell(duration_d)="{ value }"> {{ value }} </template>
      <template #cell(actions)="{ rowData: log }">
        <div class="flex justify-end items-center">
          <va-dropdown class="relative">
            <template #anchor>
              <va-icon name="more_vert" />
            </template>
            <va-dropdown-content class="absolute right-0 origin-top-right w-40">
              <div class="py-1">
                <va-button
                  preset="secondary"
                  icon="timelapse"
                  size="medium"
                  color="secondary"
                  @click="$emit('replay', log)"
                >
                  Replay
                </va-button>
                <va-button preset="secondary" icon="edit" size="medium" color="secondary" @click="$emit('edit', log)">
                  Edit
                </va-button>
                <va-button
                  preset="secondary"
                  icon="delete"
                  size="medium"
                  color="secondary"
                  @click="$emit('delete', log)"
                >
                  Delete
                </va-button>
              </div>
            </va-dropdown-content>
          </va-dropdown>
        </div>
      </template>
    </va-data-table>
    <template v-if="logbook.length > $props.pagination.perPage">
      <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
        <div>
          <b>{{ logbook.length }} trips.</b>
          Logs per page
          <va-select v-model="$props.pagination.perPage" class="!w-20" :options="[10, 20, 50, 100]" />
        </div>
        <div class="mt-3 row justify-center">
          <va-pagination v-model="$props.pagination.page" input :pages="totalPages" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .va-data-table {
    overflow-x: auto;
    ::v-deep(tbody .va-data-table__table-tr) {
      border-bottom: 1px solid var(--va-background-border);
    }
  }
</style>
