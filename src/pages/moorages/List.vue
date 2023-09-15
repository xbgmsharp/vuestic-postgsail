<template>
  <template v-if="!rowsData.length > 0">
    <nodatayet />
  </template>
  <template v-else>
    <div>
      <va-card class="mb-3">
        <va-card-content>
          <Map style="width: 100%; height: 45vh" :map_zoom="8" :moorage_map_id="0" />
        </va-card-content>
      </va-card>
      <va-card class="mb-3">
        <va-card-title>{{ $t('moorages.list.filter.title') }}</va-card-title>
        <va-card-content>
          <div class="layout gutter--md">
            <div class="py-2 grid grid-cols-12 gap-6">
              <div class="col-span-12 md:col-span-6 flex flex-col">
                <va-input
                  v-model="filter.name"
                  :label="$t('moorages.list.filter.name')"
                  placeholder="Filter by name..."
                />
              </div>
              <div class="col-span-12 md:col-span-6 flex flex-col">
                <va-input
                  v-model="filter.default_stay"
                  :label="$t('moorages.list.default_stay')"
                  placeholder="Filter by stay..."
                />
                <!--
                Filter by stay...:
                <va-select
                  v-model="filter.default_stay"
                  :options="stayed_at_options"
                  :placeholder="value"
                  outline
                  style="max-width: 150px"
                  class="mb-6"
                />
                -->
              </div>
              <va-button icon="clear" outline style="grid-column: 1 / 3; margin-right: auto" @click="resetFilter">{{
                $t('moorages.list.filter.reset')
              }}</va-button>
              <va-icon
                v-if="items.length > 0"
                name="csv"
                outline
                :size="34"
                style="grid-column-end: 11"
                class="themed"
                @click="handleCSV(items)"
              ></va-icon>
              <va-icon
                v-if="items.length > 0"
                name="gpx"
                outline
                :size="34"
                style="grid-column-end: 12"
                class="themed"
                @click="handleGPX()"
              ></va-icon>
              <va-icon
                v-if="items.length > 0"
                name="geojson"
                outline
                :size="34"
                style="grid-column-end: 13"
                class="themed"
                @click="handleGeoJSON()"
              ></va-icon>
            </div>
          </div>
        </va-card-content>
      </va-card>
      <va-card class="mb-3">
        <va-card-title>{{ $t('moorages.list.title') }}</va-card-title>
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
            <template #cell(moorage)="{ value, rowData }">
              <router-link class="text--bold" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
                {{ value }}
              </router-link>
            </template>
            <template #cell(default_stay)="{ rowData }">
              <div class="mb-6" style="max-width: 150px">
                <StayAt
                  v-if="rowData.default_stay_id"
                  :id="parseInt(rowData.id)"
                  :data="parseInt(rowData.default_stay_id)"
                  @clickFromChildComponent="updateDefaultStay"
                />
              </div>
              <!--
              <va-select
                v-if="rowData.default_stay_id"
                v-model="stayed_at_options[rowData.default_stay_id]"
                :options="stayed_at_options"
                outline
                style="max-width: 150px"
                class="mb-6"
                @update:modelValue="runBusy(updateDefaultStay, rowData.id, $event)"
              />
              -->
            </template>
            <template #cell(total_stay)="{ value }"> {{ $t('units.time.days', parseInt(value)) }}</template>
            <template #cell(arrivals_departures)="{ value }">
              {{ value }}
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
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCacheStore } from '../../stores/cache-store'
  import PostgSail from '../../services/api-client'
  import Map from '../../components/maps/leafletMapMoorages.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import nodatayet from '../../components/noDataScreen.vue'
  import StayAt from '../../components/SelectStayAt.vue'

  import mooragesData from '../../data/moorages.json'

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
    { key: 'moorage', label: t('moorages.list.moorage'), sortable: true },
    { key: 'default_stay', label: t('moorages.list.default_stay'), sortable: true },
    { key: 'total_stay', label: t('moorages.list.total_stay'), sortable: true },
    { key: 'arrivals_departures', label: t('moorages.list.arrivals'), sortable: true },
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
                return row.moorage.toLowerCase().includes(f[fkey].toLowerCase())
              case 'default_stay':
                return row.default_stay.toLowerCase().includes(f[fkey].toLowerCase())
            }
          })
        })
      : []
  })

  const pages = computed(() => {
    return Math.ceil(items.value.length / perPage.value)
  })
  // TODO Default sort on duration
  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    try {
      const response = await CacheStore.getAPI('moorages')
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
        console.log('Moorages List rowsData:', rowsData.value)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...mooragesData)
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

  const updateDefaultStay = async (update_default_stay, id) => {
    console.log('updateDefaultStay', update_default_stay, id)
    if (update_default_stay && update_default_stay > 0) {
      isBusy.value = true
      apiError.value = null
      const api = new PostgSail()
      const payload = {
        stay_code: update_default_stay,
      }
      try {
        const response = api.moorage_update(id, payload)
        if (response) {
          console.log('updateDefaultStay success', response)
          // Clean CacheStore and force refresh
          CacheStore.moorages = []
          CacheStore.moorages_get = []
          CacheStore.store_ttl = null
          CacheStore.getAPI('moorages')
        } else {
          throw { response }
        }
      } catch (err) {
        const { response } = err
        console.log('updateDefaultStay failed', response)
        apiError.value = response.message
      } finally {
        isBusy.value = false
      }
    }
  }
  /*const handleGPX = async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.moorages_export_gpx()
      if (response) {
        console.log('moorages_export_gpx success', response)
        const blob = new Blob([response], { type: 'text/xml' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'PostgSailMoorages.gpx'
        link.click()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('moorages_export_gpx failed', err)
      apiError.value = response.message
    } finally {
      isBusy.value = false
    }
  }
  const handleGeoJSON = async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.moorages_export_geojson()
      if (response) {
        console.log('moorages_export_geojson success', response)
        const blob = new Blob([response], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'PostgSailMoorages.geojson'
        link.click()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('moorages_export_geojson failed', err)
      apiError.value = response.message
    } finally {
      isBusy.value = false
    }
  }
  /*
  const handleCSV = async () => {
    let csv = Object.keys(items.value[0]) + '\n'
    csv += items.value
      .map((row) => {
        return Object.values(row).toString()
      })
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'PostgSailMoorages.csv'
    link.click()
  }*/

  function handleCSV(items) {
    runBusy(handleExport, 'csv', 'moorages', items)
  }
  function handleGPX() {
    runBusy(handleExport, 'gpx', 'moorages')
  }
  function handleGeoJSON() {
    runBusy(handleExport, 'geojson', 'moorages')
  }
</script>

<style lang="scss">
  .va-table {
    width: 100%;
  }
</style>
