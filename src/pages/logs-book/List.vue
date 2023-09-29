<template>
  <div>
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
            <va-button icon="clear" outline style="grid-column: 1 / 3; margin-right: auto" @click="resetFilter">{{
              $t('logs.list.filter.reset')
            }}</va-button>
            <va-icon
              v-if="items.length > 0"
              name="csv"
              outline
              :size="34"
              style="grid-column-end: 13"
              class="themed"
              @click="handleCSV_all(items)"
            ></va-icon>
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
          </template>
          <template #cell(duration)="{ value }">
            {{ durationFormatHours(value) }} {{ durationI18nHours(value) }}
          </template>
          <!--
          <template #cell(action)="{ rowData.id }">
            <va-select
              :options="action_options"
              placeholder="..."
              style="max-width: 8rem"
              outline
              @update:modelValue="handleAction($event, rowData.id)"
            />
          </template>
          -->
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
  import { dateFormatUTC, durationFormatHours, durationI18nHours } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { asBusy, handleExport } from '../../utils/handleExports'

  import logsDatas from '../../data/logs.json'

  const CacheStore = useCacheStore()

  const { t } = useI18n()

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
    //{ key: 'action', label: t('logs.log.action') },
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
        console.log('Logs list', rowsData.value)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
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

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
