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
                style="width: 100%"
                :readonly="false"
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
      <va-card-title>{{ $t('stays.list.title') }}</va-card-title>
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
          class="datatable"
        >
          <template #cell(name)="{ value, rowData }">
            <router-link
              v-if="value"
              class="va-link link"
              :to="{ name: 'stay-details', params: { id: rowData.id || 0 } }"
            >
              {{ value }}
            </router-link>
          </template>
          <template #cell(moorage)="{ value, rowData }">
            <router-link
              class="va-link link"
              :to="{ name: 'moorage-details', params: { id: rowData.moorage_id || 0 } }"
            >
              {{ value }}
            </router-link>
          </template>
          <template #cell(arrived)="{ value, rowData }">
            <router-link
              v-if="typeof rowData.departed_log_id !== 'undefined'"
              class="va-link link"
              :to="{ name: 'log-details', params: { id: rowData.departed_log_id || 0 } }"
            >
              {{ dateFormatUTC(value) }}
            </router-link>
          </template>
          <template #cell(departed)="{ value, rowData }">
            <router-link
              v-if="typeof rowData.arrived_log_id !== 'undefined'"
              class="va-link link"
              :to="{ name: 'log-details', params: { id: rowData.arrived_log_id || 0 } }"
            >
              {{ dateFormatUTC(value) }}
            </router-link>
          </template>
          <template #cell(stayed_at)="{ rowData }">
            <div v-if="rowData.stayed_at_id" style="max-width: 150px">
              <!-- :key to enforce refresh on filter -->
              <StayAt
                :id="parseInt(rowData.id)"
                :key="rowData.id"
                :data="parseInt(rowData.stayed_at_id)"
                @clickFromChildComponent="updateStayedAt"
              />
            </div>
            <!--
            <va-select
              :v-model="getTextForStayedAt(rowData.stayed_at_id)"
              :options="stayed_at_options"
              :placeholder="value"
              outline
              style="max-width: 120px"
              @update:modelValue="runBusy(updateStayedAt, rowData.id, $event)"
            />
            -->
          </template>
          <template #cell(duration)="{ value }">
            {{ durationDays(value) }}
          </template>
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
            @click="handleCSV(items)"
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
  import PostgSail from '../../services/api-client'
  import { default as utils } from '../../utils/utils.js'
  import { dateFormatUTC, durationFormatDays } from '../../utils/dateFormatter.js'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import StayAt from '../../components/SelectStayAt.vue'

  import staysData from '../../data/stays.json'

  const { t } = useI18n()
  const getDefaultFilter = () => {
    return {
      name: null,
      dateRange: null,
    }
  }

  const CacheStore = useCacheStore()
  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const perPage = ref(20)
  const currentPage = ref(1)
  const columns = ref([
    { key: 'name', label: t('stays.stay.name'), sortable: true },
    { key: 'moorage', label: t('stays.stay.moorage'), sortable: true },
    { key: 'arrived', label: t('stays.stay.arrived'), sortable: true },
    { key: 'departed', label: t('stays.stay.departed'), sortable: true },
    { key: 'stayed_at', label: t('stays.stay.stayed_at'), sortable: true },
    { key: 'duration', label: t('stays.stay.duration'), sortable: true, sortingFn: utils.sortNum, tdAlign: 'right' },
  ])
  const filter = reactive(getDefaultFilter())

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value.filter((row) => {
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
                  row.moorage.toLowerCase().includes(f[fkey].toLowerCase())
                )
              case 'dateRange':
                return areIntervalsOverlapping({ start: new Date(row.arrived), end: new Date(row.departed) }, f[fkey])
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
      const response = await CacheStore.getAPI('stays')
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
        console.log('Stays List rowsData:', rowsData.value)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...staysData)
      }
    } finally {
      isBusy.value = false
    }
  })

  function runBusy(fn, ...args) {
    asBusy(isBusy, apiError, fn, ...args)
  }

  function updateStayedAt(update_stayed_at, id) {
    // runBusy handles isBusy & apiError
    console.log('updateStayedAt', update_stayed_at, id)
    if (update_stayed_at && update_stayed_at > 0) {
      new PostgSail()
        .stay_update(id, { stay_code: update_stayed_at })
        .then((response) => {
          console.log('updateStayedAt success', response)
          // Clean CacheStore and force refresh
          CacheStore.stays = []
          CacheStore.stays_get = []
          CacheStore.store_ttl = null
          CacheStore.getAPI('stays')
        })
        .catch((err) => {
          console.log('updateStayedAt failed', err.message ?? err)
          //throw err.message ?? err
        })
    }
  }

  function handleCSV(items) {
    runBusy(handleExport, 'csv', 'stays', items)
  }
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
