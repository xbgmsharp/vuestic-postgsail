<template>
  <div>
    <filter-card></filter-card>
    <va-card class="mb-3">
      <va-card-title>{{ $t('logs.list.filter.title') }}</va-card-title>
      <va-card-content>
        <div class="layout gutter--md">
          <div class="py-2 grid grid-cols-12 gap-6">
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-input v-model="filter.name" :label="$t('logs.list.filter.name')" placeholder="Filter by name..." />
            </div>
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-date-input
                v-model="filter.dateRange"
                :label="$t('logs.list.filter.date_range')"
                :readonly="false"
                mode="range"
              />
            </div>
            <!--<div class="flex xs12">
              <div class="flex flex-row-reverse justify-center">
                <va-button icon="clear" outline @click="resetFilter">{{ $t('logs.list.filter.reset') }}</va-button>
              </div>
            </div>-->
            <va-button icon="clear" outline style="grid-column: 1 / 3; margin-right: auto" @click="resetFilter">{{
              $t('logs.list.filter.reset')
            }}</va-button>
            <va-button
              icon="csv"
              outline
              style="grid-column-end: 11"
              @click="() => runBusy(handleCSV, items)"
            ></va-button>
            <va-button icon="gpx" outline style="grid-column-end: 12" @click="() => runBusy(handleGPX)"></va-button>
            <va-button
              icon="geojson"
              outline
              style="grid-column-end: 13"
              @click="() => runBusy(handleGeoJSON)"
            ></va-button>
          </div>
        </div>
      </va-card-content>
    </va-card>
    <va-card>
      <va-card-title>{{ $t('logs.list.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <va-data-table
          :columns="columns"
          :items="items"
          :loading="isBusy"
          :per-page="perPage"
          :current-page="currentPage"
          striped
          hoverable
        >
          <template #cell(name)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'log-details', params: { id: rowData.id } }">
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
            {{ distanceFormat(value) }}
            <!--{{ value }}-->
          </template>
          <template #cell(duration)="{ value }">
            {{ durationFormatHours(value) }} {{ $t('logs.log.duration_unit') }}
          </template>
        </va-data-table>
        <template v-if="items.length > perPage">
          <div class="mt-3 row justify-center">
            <va-pagination v-model="currentPage" input :pages="pages" />
          </div>
        </template>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { areIntervalsOverlapping } from 'date-fns'
  import { useI18n } from 'vue-i18n'
  import { useCacheStore } from '../../stores/cache-store'
  import { dateFormat, dateFormatUTC, durationFormat, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { asBusy, handleCSV, handleGPX, handleGeoJSON } from '../../utils/handleExports'

  import logsDatas from '../../data/logs.json'

  const CacheStore = useCacheStore()

  const { t } = useI18n()
  const getDefaultFilter = () => {
    return {
      name: null,
      dateRange: null,
    }
  }

  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const perPage = ref(20)
  const currentPage = ref(1)
  const columns = ref([
    { key: 'name', label: t('logs.log.name'), sortable: true },
    { key: 'from', label: t('logs.log.from'), sortable: true },
    { key: 'to', label: t('logs.log.to'), sortable: true },
    { key: 'fromTime', label: t('logs.log.from_time'), sortable: true },
    { key: 'toTime', label: t('logs.log.to_time'), sortable: true },
    { key: 'distance', label: t('logs.log.distance'), sortable: true },
    { key: 'duration', label: t('logs.log.duration'), sortable: true },
  ])
  const filter = reactive(getDefaultFilter())

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value
          .map((row) => ({
            id: row.id,
            name: row.Name,
            from: row.From,
            to: row.To,
            fromTime: row.Started,
            toTime: row.Ended,
            distance: row.Distance,
            duration: row.Duration,
          }))
          .filter((row) => {
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
                  return row.name.toLowerCase().includes(f[fkey].toLowerCase())
                case 'dateRange':
                  return areIntervalsOverlapping({ start: new Date(row.fromTime), end: new Date(row.toTime) }, f[fkey])
              }
            })
          })
      : []
  })

  const pages = computed(() => {
    return Math.ceil(items.value.length / perPage.value)
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    try {
      const response = await CacheStore.getAPI('logs')
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample datas from local json...', apiError.value)
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...logsDatas)
      }
    } finally {
      isBusy.value = false
    }
  })

  function resetFilter() {
    Object.assign(filter, { ...getDefaultFilter() })
  }

  function runBusy(fn, ...args) {
    asBusy(isBusy, apiError, fn, ...args)
  }
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
