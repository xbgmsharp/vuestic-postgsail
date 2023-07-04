<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>{{ $t('stays.list.filter.title') }}</va-card-title>
      <va-card-content>
        <div class="layout gutter--md">
          <div class="py-2 grid grid-cols-12 gap-6">
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-input v-model="filter.name" :label="$t('stays.list.filter.name')" placeholder="Filter by name..." />
            </div>
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-date-input
                v-model="filter.dateRange"
                :label="$t('stays.list.filter.date_range')"
                style="width: 100%"
                :readonly="false"
                mode="range"
              />
            </div>
            <va-button icon="clear" outline style="grid-column: 1 / 3; margin-right: auto" @click="resetFilter">{{
              $t('stays.list.filter.reset')
            }}</va-button>
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
            <router-link class="text--bold stay-name" :to="{ name: 'stay-details', params: { id: rowData.id } }">
              {{ value }}
            </router-link>
          </template>
          <template #cell(moorage)="{ value }">
            {{ value }}
          </template>
          <template #cell(arrived)="{ value }">
            {{ dateFormatUTC(value) }}
          </template>
          <template #cell(departed)="{ value }">
            {{ dateFormatUTC(value) }}
          </template>
          <template #cell(stayed_at)="{ rowData, value }">
            <va-select
              v-model="rowData.stayed_at"
              :options="stayed_at_options"
              :placeholder="value"
              outline
              style="max-width: 120px"
              @update:modelValue="runBusy(updateStayedAt, rowData.id, $event)"
            />
          </template>
          <template #cell(duration)="{ value }">
            {{ durationFormatDays(value) }} {{ $t('stays.stay.duration_unit') }}
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
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC, durationFormatDays } from '../../utils/dateFormatter.js'
  import { asBusy, handleExport } from '../../utils/handleExports'

  import staysDatas from '../../data/stays.json'

  const stayed_at_options = ref([
    {
      value: 1,
      text: 'Unknown',
    },
    {
      value: 2,
      text: 'Anchor',
    },
    {
      value: 3,
      text: 'Mooring Buoy',
    },
    {
      value: 4,
      text: 'Dock',
    },
  ])

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
    { key: 'name', label: t('stays.stay.name'), sortable: true },
    { key: 'moorage', label: t('stays.stay.moorage'), sortable: true },
    { key: 'arrived', label: t('stays.stay.arrived'), sortable: true },
    { key: 'departed', label: t('stays.stay.departed'), sortable: true },
    { key: 'stayed_at', label: t('stays.stay.stayed_at'), sortable: true },
    { key: 'duration', label: t('stays.stay.duration'), sortable: true },
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
                return row.name.toLowerCase().includes(f[fkey].toLowerCase())
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
      const response = await useCacheStore().getAPI('stays')
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
        rowsData.value.push(...staysDatas)
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

  function updateStayedAt(id, stayed_at) {
    // runBusy handles isBusy & apiError
    console.log(stayed_at)
    new PostgSail()
      .stay_update(id, { stay_code: stayed_at.value })
      .then((response) => {
        console.log('updateStayedAt success', response)
      })
      .catch((err) => {
        console.log('updateStayedAt failed', err.message ?? err)
        //throw err.message ?? err
      })
  }

  function handleCSV(items) {
    runBusy(handleExport, 'csv', 'stays', items)
  }
</script>
