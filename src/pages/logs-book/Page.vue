<template>
  <va-card>
    <va-card-title>{{ title }}</va-card-title>
    <va-card-content>
      <template v-if="logs.isError.value">
        <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ logs.error.value?.message }}</va-alert>
      </template>
      <template v-if="apiError">
        <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
      </template>

      <div class="flex flex-col lg:flex-row items-center gap-4 mb-2 justify-between">
        <div class="flex flex-col lg:flex-row gap-2 justify-start">
          <va-button-toggle
            v-model="doShowAsCards"
            preset="secondary"
            border-color="primary"
            size="large"
            :options="[
              { label: 'Cards', value: 1 },
              { label: 'Table', value: 2 },
            ]"
          />
        </div>
        <div v-if="doShowAsCards < 3" class="layout flex flex-col lg:flex-row gap-4 flex-1">
          <va-input
            v-model="filter.name"
            :clearable="true"
            :placeholder="$t('logs.list.filter.name')"
            size="large"
            class="flex-1"
          />
          <va-date-input
            v-model="filter.dateRange"
            :clearable="true"
            :placeholder="$t('logs.list.filter.date_range')"
            mode="range"
            size="large"
            class="flex-1"
          />
          <va-select
            v-model="filter.tags"
            :placeholder="$t('logs.list.filter.tags')"
            :options="tagsOptions"
            size="large"
            class="flex-1"
            multiple
          >
            <template #content="{ value }">
              <va-chip
                v-for="chip in value"
                :key="chip"
                size="small"
                class="xs-chip mr-2"
                outline
                closeable
                @update:modelValue="deleteChip(chip)"
              >
                {{ chip }}
              </va-chip>
            </template>
          </va-select>
        </div>
      </div>

      <logbook-cards
        v-if="doShowAsCards === 1"
        :logbook="items"
        :loading="logs.isFetching.value"
        @edit="editTrip"
        @delete="onTripDeleted"
        @replay="replayTrip"
        @replay3d="replayTrip3D"
        @merge="mergeTrip"
        @logslapse="logslapse"
      />
      <logbook-table
        v-if="doShowAsCards === 2"
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :logbook="items"
        :loading="logs.isFetching.value"
        @edit="editTrip"
        @delete="onTripDeleted"
        @replay="replayTrip"
        @replay3d="replayTrip3D"
        @merge="mergeTrip"
        @logslapse="logslapse"
      />

      <template v-if="logs.totalCount.value > pageSize">
        <div class="mt-3 row justify-center">
          <va-pagination v-model="currentPage" input :pages="logs.totalPages.value" />
        </div>
      </template>

      <template v-if="stats">
        <div class="flex flex-wrap gap-4 mt-4 py-3 border-t border-[var(--va-background-element)] text-md">
          <span
            ><strong>{{ $t('stats.count') }}:</strong> {{ stats.totalTrips }}</span
          >
          <span
            ><strong>{{ $t('stats.sum_duration') }}:</strong> {{ stats.sumDuration }}</span
          >
          <span
            ><strong>{{ $t('stats.total_duration') }}:</strong> {{ stats.totalDuration }}</span
          >
          <span
            ><strong>{{ $t('stats.sum_distance') }}:</strong> {{ stats.totalDistance }}</span
          >
        </div>
      </template>

      <div v-if="doShowAsCards < 3" class="flex mt-4">
        <va-icon
          v-if="logs.totalCount.value > 0"
          name="csv"
          outline
          :size="34"
          style="grid-column-end: 12"
          class="themed"
          @click="handleCSV_all()"
        ></va-icon>
      </div>
    </va-card-content>
  </va-card>

  <va-modal v-model="showModal" no-padding>
    <template #content="{ cancel }">
      <va-card-title>
        {{ t('logs.list.merge_modal.title') }}
      </va-card-title>
      <va-card-content>
        <va-inner-loading :loading="isBusy">
          <p class="mb-3 font-bold text-warning">⚠️ {{ t('logs.list.merge_modal.title') }}</p>
          <va-alert color="warning" outline class="mb-3">
            {{ t('logs.list.merge_modal.message') }}
          </va-alert>
          <va-alert color="danger" outline class="mb-3">
            {{ t('logs.list.merge_modal.danger') }}
          </va-alert>
          <template v-if="apiError">
            <va-alert color="danger" outline class="mb-4"> {{ t('api.error') }}: {{ apiError }} </va-alert>
          </template>
          <div class="mb-4">from/start log: {{ start_trip?.name }} - {{ dateFormatUTC(start_trip?.fromTime) }}</div>
          <div class="mb-4">to/end log: {{ end_trip?.name }} - {{ dateFormatUTC(end_trip?.fromTime) }}</div>
        </va-inner-loading>
      </va-card-content>
      <va-card-actions style="display: flex; justify-content: flex-end !important; gap: 0.5rem">
        <va-button color="danger" @click="cancel">{{ t('vuestic.cancel') }}</va-button>
        <va-button color="primary" @click="handleMerge">
          {{ t('vuestic.ok') }} {{ t('logs.list.merge_modal.title') }}
        </va-button>
      </va-card-actions>
    </template>
  </va-modal>
</template>

<script setup>
  import { computed, ref, reactive, watch } from 'vue'
  import { watchDebounced } from '@vueuse/core'
  import { useI18n } from 'vue-i18n'
  import { setAppTitle } from '../../utils/app.js'
  import { distanceFormat, distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import {
    durationFormatHours,
    dateFormatUTC,
    durationHours,
    hoursToHumanMoment,
    durationFromTS,
  } from '../../utils/dateFormatter.js'
  import { downloadFile } from '../../utils/handleExports'
  import { useRouter } from 'vue-router'
  import LogbookCards from './widgets/Cards.vue'
  import LogbookTable from './widgets/Table.vue'
  import { useModal, useToast } from 'vuestic-ui'
  import { useGlobalStore } from '../../stores/global-store'
  import { storeToRefs } from 'pinia'
  import { useVesselStore } from '../../stores/vessel-store'
  import { useLogsList, useLogs, useDeleteLog, useMergeLogs, exportLogsCSV, useLogTags } from '../../queries/logs'

  const { vesselName } = useVesselStore()
  const GlobalStore = useGlobalStore()
  const { isMobile, doShowAsCards } = storeToRefs(GlobalStore)
  const router = useRouter()
  const { t } = useI18n()
  const sorting = ref({ sortBy: 'started', sortingOrder: 'desc' })
  const { confirm } = useModal()
  const { init: notify } = useToast()
  const showModal = ref(false)
  const start_trip = ref(null)
  const end_trip = ref(null)
  const isBusy = ref(false)
  const apiError = ref(null)

  if (isMobile.value) doShowAsCards.value = 1
  watch(doShowAsCards, () => {
    GlobalStore.$state.doShowAsCards = doShowAsCards.value
  })

  const pageSize = 20
  const currentPage = ref(1)

  const filter = reactive({ name: null, dateRange: null, tags: [] })
  const queryFilters = ref({ name: null, dateRange: null, tags: [] })
  watchDebounced(
    () => ({ name: filter.name, dateRange: filter.dateRange, tags: [...filter.tags] }),
    (val) => {
      currentPage.value = 1
      queryFilters.value = val
    },
    { debounce: 400, immediate: true },
  )

  const logs = useLogsList({ page: currentPage, pageSize, filters: queryFilters })
  const { data: allLogs } = useLogs()
  const { tags: tagsOptions } = useLogTags()

  const items = computed(() =>
    logs.items.value.map((row) => ({
      id: row.id,
      name: row.name,
      from: row.from,
      to: row.to,
      fromTime: row.started,
      toTime: row.ended,
      distance: row.distance,
      distance_nm: distanceFormat(row.distance),
      duration: row.duration,
      duration_h: durationFormatHours(row.duration),
      fromMoorageId: row._from_moorage_id,
      toMoorageId: row._to_moorage_id,
      tags: row.tags,
    })),
  )

  const stats = computed(() => {
    const all = Array.isArray(allLogs.value) ? allLogs.value : []
    if (all.length === 0) return null

    const f = queryFilters.value
    const filtered = all.filter((row) => {
      if (f.name) {
        const q = f.name.toLowerCase()
        if (
          !row.name?.toLowerCase().includes(q) &&
          !row.from?.toLowerCase().includes(q) &&
          !row.to?.toLowerCase().includes(q)
        )
          return false
      }
      if (f.dateRange?.start && f.dateRange?.end) {
        if (new Date(row.started) > new Date(f.dateRange.end) || new Date(row.ended) < new Date(f.dateRange.start))
          return false
      }
      if (f.tags?.length) {
        const rowTags = Array.isArray(row.tags) ? row.tags : []
        if (!f.tags.some((t) => rowTags.includes(t))) return false
      }
      return true
    })

    if (filtered.length === 0) return null
    const distance = filtered.reduce((acc, row) => acc + (row.distance || 0), 0)
    const duration = filtered.reduce((acc, row) => acc + durationHours(row.duration), 0)
    const sorted = [...filtered].sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime())
    return {
      totalTrips: logs.totalCount.value,
      totalDistance: distanceFormatMiles(distance),
      sumDuration: hoursToHumanMoment(duration),
      totalDuration: durationFromTS(sorted[sorted.length - 1].ended, sorted[0].started),
    }
  })

  const title = t('logs.list.title') + ' ' + vesselName
  document.title = setAppTitle(title)

  function deleteChip(chip) {
    filter.tags = filter.tags.filter((v) => v !== chip)
  }

  const { mutateAsync: deleteLog } = useDeleteLog()

  const onTripDeleted = async (log) => {
    const confirmed = await confirm({
      title: 'Delete trip',
      message: `Are you sure you want to delete trip "${log.name}"? This will permanently delete the Log Entry and any associated Stays. Do you really want to continue?`,
      okText: 'Delete',
      size: 'small',
      maxWidth: '380px',
    })
    if (!confirmed) return
    if (GlobalStore.readOnly) {
      notify({ message: 'Demo account readonly', position: 'top-right', color: 'warning' })
      return
    }
    isBusy.value = true
    apiError.value = null
    try {
      await deleteLog(String(log.id))
      notify({ message: 'Successfully deleted log entry', position: 'top-right', color: 'success' })
    } catch (err) {
      console.error('log_delete failed', err)
      apiError.value = err.message
      notify({ message: 'Error deleting log entry', position: 'top-right', color: 'warning' })
    } finally {
      isBusy.value = false
    }
  }

  const editTrip = (log) => router.push({ name: 'log-map', params: { id: log.id } })
  const replayTrip = (log) => router.push({ name: 'timelapse-replay', params: { id: log.id } })
  const replayTrip3D = (log) => router.push({ name: 'timelapse3d-replay', params: { id: log.id } })
  const logslapse = (log) => router.push({ name: 'logslapse', query: { start_log: log.id, end_log: log.id } })

  const { mutateAsync: mergeLogs } = useMergeLogs()

  function findAdjacentLogs(logId) {
    const index = items.value.findIndex((log) => log.id === logId)
    if (index === -1) return null
    return items.value[index - 1] ?? null
  }

  const mergeTrip = (log) => {
    start_trip.value = log
    end_trip.value = findAdjacentLogs(log.id)
    if (!end_trip.value) {
      notify({ message: 'No adjacent log found', position: 'top-right', color: 'warning' })
      return
    }
    showModal.value = true
  }

  async function handleMerge() {
    if (!start_trip.value || !end_trip.value) {
      notify({ message: 'handleMerge ignore', position: 'top-right', color: 'warning' })
      return
    }
    if (start_trip.value.id > end_trip.value.id) {
      notify({ message: 'handleMerge ignore', position: 'top-right', color: 'warning' })
      return
    }
    isBusy.value = true
    apiError.value = null
    try {
      await mergeLogs({ id_start: start_trip.value.id, id_end: end_trip.value.id })
      notify({ message: 'Successfully merged log entry', position: 'top-right', color: 'success' })
      showModal.value = false
    } catch (err) {
      console.error('log_merge failed', err)
      apiError.value = err.message
      notify({ message: 'Error merging log entry', position: 'top-right', color: 'warning' })
    } finally {
      isBusy.value = false
    }
  }

  const isExporting = ref(false)

  async function handleCSV_all() {
    isExporting.value = true
    try {
      const csv = await exportLogsCSV(queryFilters.value)
      downloadFile(csv, 'text/csv', 'PostgSail_Logs.csv')
    } catch (err) {
      console.error('CSV export failed', err)
    } finally {
      isExporting.value = false
    }
  }
</script>

<style lang="scss">
  .xs-chip {
    padding: 0.25rem 0.25rem;
    font-size: 0.75rem;
    line-height: 1;
    height: 1.1rem;
  }
</style>
