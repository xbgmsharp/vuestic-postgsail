<template>
  <va-card>
    <va-card-title>{{ title }}</va-card-title>
    <va-card-content>
      <div class="flex flex-col lg:flex-row gap-4 mb-2 justify-between">
        <div class="flex flex-col lg:flex-row gap-2 justify-start">
          <va-button-toggle
            v-model="doShowAsCards"
            preset="secondary"
            border-color="primary"
            size="large"
            :options="[
              { label: 'Cards', value: 1 },
              { label: 'Table', value: 2 },
              { label: 'Map', value: 3 },
            ]"
          />
        </div>
        <div v-if="doShowAsCards != 3" class="layout flex flex-col lg:flex-row gap-4 justify-between">
          <va-input v-model="filter.name" :clearable="true" placeholder="Filter by name..." />
          <va-date-input
            v-model="filter.dateRange"
            style="width: 100%"
            :clearable="true"
            placeholder="Filter by date range..."
            mode="range"
          />
        </div>
        <div v-else class="layout flex">
          <p class="text-center">Showing only last 10 logs.</p>
        </div>
      </div>

      <LogbookCards
        v-if="doShowAsCards === 1"
        :logbook="items"
        :loading="isBusy"
        @edit="editTrip"
        @delete="onTripDeleted"
        @replay="replayTrip"
      />
      <LogbookTable
        v-if="doShowAsCards === 2"
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        v-model:pagination="pagination"
        :logbook="items"
        :loading="isBusy"
        @edit="editTrip"
        @delete="onTripDeleted"
        @replay="replayTrip"
      />
      <LogbookMap v-if="doShowAsCards === 3" :loading="isBusy" />
      <div class="flex mt-4">
        <va-icon
          v-if="items.length > 0"
          name="csv"
          outline
          :size="34"
          style="grid-column-end: 12"
          class="themed"
          @click="handleCSV_all(items)"
        ></va-icon>
      </div>
    </va-card-content>
  </va-card>
</template>

<script setup>
  import { computed, ref, reactive, onMounted, watch } from 'vue'
  import { areIntervalsOverlapping } from 'date-fns'
  import { useI18n } from 'vue-i18n'
  import { useCacheStore } from '../../stores/cache-store'
  import { setAppTitle } from '../../utils/app.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { durationFormatHours } from '../../utils/dateFormatter.js'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import { useRoute } from 'vue-router'
  import logsData from '../../data/logs.json'
  import LogbookCards from './widgets/Cards.vue'
  import LogbookTable from './widgets/Table.vue'
  import LogbookMap from './widgets/Map.vue'
  import { useModal, useToast } from 'vuestic-ui'
  import { useRouter } from 'vue-router'
  import { useGlobalStore } from '../../stores/global-store'
  import { storeToRefs } from 'pinia'
  import PostgSail from '../../services/api-client'
  import { useVesselStore } from '../../stores/vessel-store'

  const { vesselName, vesselType } = useVesselStore()

  const GlobalStore = useGlobalStore()
  const { isMobile, doShowAsCards, readOnly } = storeToRefs(GlobalStore)

  const CacheStore = useCacheStore()
  const router = useRouter()
  const { t } = useI18n()
  const sorting = ref({ sortBy: 'started', sortingOrder: 'desc' })
  const { confirm } = useModal()
  const { init: notify } = useToast()

  // If mobile display as card by default.
  if (isMobile.value) {
    doShowAsCards.value = 1
  }
  watch(doShowAsCards, () => {
    console.log('doShowAsCards ref changed!')
    console.log('doShowAsCards:', doShowAsCards.value)
    GlobalStore.$state.doShowAsCards = doShowAsCards.value
  })

  const onTripDeleted = async (log) => {
    const response = await confirm({
      title: 'Delete trip',
      message: `Are you sure you want to delete trip "${log.name}"? This will permanently delete the Log Entry and any associated Stays. Do you really want to continue?`,
      okText: 'Delete',
      size: 'small',
      maxWidth: '380px',
    })

    if (!response) {
      return
    }

    if (GlobalStore.readOnly) {
      notify({
        message: `Demo account readonly`,
        position: 'top-right',
        color: 'warning',
      })
      return
    }

    const api = new PostgSail()
    try {
      const response = await api.log_delete(log.id)
      if (response) {
        console.log('log_delete success', response)
        // Remove from layout
        const indexToRemove = rowsData.value.findIndex((trip) => trip.id === log.id)
        rowsData.value.splice(indexToRemove, 1)
        // Clean CacheStore and force refresh
        CacheStore.logs = []
        CacheStore.logs_get = []
        CacheStore.store_ttl = null
        const resp = await CacheStore.getAPI('logs')
        if (Array.isArray(resp)) {
          rowsData.value.splice(0, rowsData.value.length || [])
          rowsData.value.push(...resp)
          console.log('Logs list', rowsData.value)
        }
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_delete failed', err)
      apiError.value = response.message
    } finally {
      isBusy.value = false
      notify({
        message: apiError.value ? `Error deleting log entry` : `Successfully deleted log entry`,
        position: 'top-right',
        color: apiError.value ? 'warning' : 'success',
      })
    }
  }

  const editTrip = async (log) => {
    router.push({ name: 'log-map', params: { id: log.id } })
    return
  }

  const replayTrip = async (log) => {
    router.push({ name: 'timelapse-replay', params: { id: log.id } })
    return
  }

  const exportGPX = async (log) => {
    handleGPX({ _id: log.id })
  }

  const action_options = [
      {
        value: null,
        text: '...',
      },
      {
        value: handleCSV,
        text: t('logs.log.export') + ' CSV',
      },
      {
        value: handleGPX,
        text: t('logs.log.export') + ' GPX',
      },
    ],
    action_verbs = {
      handleCSV,
      handleGPX,
    }

  const getDefaultFilter = () => {
    return {
      name: null,
      dateRange: null,
    }
  }

  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const filter = reactive(getDefaultFilter())
  const filter_moorage_id = route.params.id || null
  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value
          .map((row) => ({
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
          }))
          .filter((row) => {
            if (filter_moorage_id) {
              console.log('filter on moorage id')
              if (row.fromMoorageId == filter_moorage_id || row.toMoorageId == filter_moorage_id) {
                return true
              }
              return false
            } else {
              const f = filter
              if (Object.keys(f).every((fkey) => !f[fkey])) {
                return true
              }
              return Object.keys(f).every((fkey) => {
                if (!f[fkey]) {
                  return true
                }
                switch (fkey) {
                  case 'name':
                    return (
                      row.name.toLowerCase().includes(f[fkey].toLowerCase()) ||
                      row.from.toLowerCase().includes(f[fkey].toLowerCase()) ||
                      row.to.toLowerCase().includes(f[fkey].toLowerCase())
                    )
                  case 'dateRange':
                    // TODO: temp fix for Vuestic date range bug
                    if (!f[fkey].start || !f[fkey].end) {
                      return true
                    }
                    return areIntervalsOverlapping(
                      { start: new Date(row.fromTime), end: new Date(row.toTime) },
                      f[fkey],
                    )
                }
              })
            }
          })
      : []
  })

  const pagination = reactive({ page: 1, perPage: 10, total: items.value.length })

  const title = t('logs.list.title') + ' ' + vesselName

  onMounted(async () => {
    document.title = setAppTitle(title)

    isBusy.value = true
    apiError.value = null
    try {
      const response = await CacheStore.getAPI('logs')
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
        console.log('Logs list', rowsData.value)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...logsData)
      }
    } finally {
      isBusy.value = false
    }
  })

  function runBusy(fn, ...args) {
    asBusy(isBusy, apiError, fn, ...args)
  }

  function handleCSV_all(items) {
    runBusy(handleExport, 'csv', 'logs', items)
  }
  function handleCSV(item) {
    runBusy(handleExport, 'csv', 'log', [item])
  }
  function handleGPX(item) {
    runBusy(handleExport, 'gpx', 'log', item)
  }
  function handleAction({ value }, id) {
    value(id)
  }
</script>
