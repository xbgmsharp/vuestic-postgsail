<script setup lang="ts">
  import { PropType } from 'vue'
  import { defineVaDataTableColumns } from 'vuestic-ui'
  import { useVModel } from '@vueuse/core'
  import { Log } from '../types'
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
  })

  const emit = defineEmits<{
    (event: 'edit', log: Log): void
    (event: 'delete', log: Log): void
    (event: 'replay', log: Log): void
    (event: 'replay3d', log: Log): void
    (event: 'merge', log: Log): void
    (event: 'logslapse', log: Log): void
  }>()

  const sortByVModel = useVModel(props, 'sortBy', emit)
  const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
</script>

<template>
  <div>
    <va-data-table :columns="columns" :items="logbook" :loading="loading" striped hoverable>
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
        <div class="flex gap-2 justify-end">
          <va-dropdown class="">
            <template #anchor>
              <va-icon name="more_vert" />
            </template>
            <va-dropdown-content class="float-left">
              <va-button
                class="grid grid-cols-1"
                preset="secondary"
                icon="timelapse"
                size="medium"
                color="secondary"
                @click="$emit('replay', log)"
              >
                {{ t('logs.list.replay') }}
              </va-button>
              <va-button
                class="grid grid-cols-1"
                preset="secondary"
                icon="timelapse"
                size="medium"
                color="secondary"
                @click="$emit('replay3d', log)"
              >
                {{ t('logs.list.replay') }} 3D
              </va-button>
              <va-button
                class="grid grid-cols-1"
                preset="secondary"
                icon="edit"
                size="medium"
                color="secondary"
                @click="$emit('edit', log)"
              >
                {{ t('logs.list.edit') }}
              </va-button>
              <va-button
                class="grid grid-cols-1"
                preset="secondary"
                icon="delete"
                size="medium"
                color="secondary"
                @click="$emit('delete', log)"
              >
                {{ t('logs.list.delete') }}
              </va-button>
              <va-button
                class="grid grid-cols-1"
                preset="secondary"
                icon="merge"
                color="secondary"
                @click="$emit('merge', log)"
              >
                {{ t('logs.list.merge') }}
              </va-button>
              <va-button
                class="grid grid-cols-1"
                preset="secondary"
                icon="merge"
                color="secondary"
                @click="$emit('logslapse', log)"
              >
                {{ t('timeline.view_logbook') }}
              </va-button>
            </va-dropdown-content>
          </va-dropdown>
        </div>
      </template>
    </va-data-table>
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
