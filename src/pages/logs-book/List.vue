<template>
  <div>
    <va-card class="mb-3">
      <va-card-content>
        <div class="layout gutter--md">
          <div class="py-2 grid grid-cols-12 gap-6">
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-input v-model="filter.name" :clearable="true" placeholder="Filter by name..." />
            </div>
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-date-input
                v-model="filter.dateRange"
                :clearable="true"
                placeholder="Filter by date range..."
                mode="range"
              />
            </div>
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
            <router-link
              class="va-link link"
              :to="{ name: 'moorage-details', params: { id: rowData.fromMoorageId || 0 } }"
            >
              {{ value }}
            </router-link>
          </template>
          <template #cell(to)="{ value, rowData }">
            <router-link
              class="va-link link"
              :to="{ name: 'moorage-details', params: { id: rowData.toMoorageId || 0 } }"
            >
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
          <template #cell(duration)="{ value }">
            {{ value }}
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
        <div class="flex mt-4">
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
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { areIntervalsOverlapping } from 'date-fns'
  import { useI18n } from 'vue-i18n'
  import { useCacheStore } from '../../stores/cache-store'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { default as utils } from '../../utils/utils.js'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import { useRoute } from 'vue-router'
  import { useGlobalStore } from '../../stores/global-store'
  const { isLoggedIn, publicVessel, instagram, website } = useGlobalStore()
  import logsData from '../../data/logs.json'

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

  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const perPage = ref(20)
  const currentPage = ref(1)
  const columns = ref([
    { key: 'name', label: t('logs.log.name'), sortable: true },
    { key: 'from', label: t('logs.list.from'), sortable: true },
    { key: 'to', label: t('logs.list.to'), sortable: true },
    { key: 'fromTime', label: t('logs.list.from_time'), sortable: true },
    { key: 'toTime', label: t('logs.list.to_time'), sortable: true },
    { key: 'distance', label: t('logs.log.distance'), sortable: true, sortingFn: utils.sortNum, tdAlign: 'right' },
    { key: 'duration', label: t('logs.log.duration'), sortable: true, sortingFn: utils.sortNum, tdAlign: 'right' },
    //{ key: 'action', label: t('logs.log.action') },
  ])
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
            distance: distanceFormat(row.distance),
            duration: durationFormatHours(row.duration),
            fromMoorageId: row._from_moorage_id,
            toMoorageId: row._to_moorage_id,
          }))
          .filter((row) => {
            if (filter_moorage_id && row.fromMoorageId != filter_moorage_id && row.toMoorageId != filter_moorage_id) {
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

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
