<template>
  <template v-if="!rowsData.length > 0">
    <nodatayet />
  </template>
  <template v-else>
    <div>
      <va-card class="mb-3">
        <va-card-content>
          <Map style="width: 100%; height: 40vh" :zoom="12" :moorage-map-id="Number.parseInt(route.params.id)" />
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
            class="datatable"
          >
            <template #cell(arrived)="{ rowData }">
              <router-link class="va-link link" :to="{ name: 'log-details', params: { id: rowData._to_id } }">
                {{ dateFormatUTC(rowData._to_time) }}
              </router-link>
            </template>
            <template #cell(departed)="{ rowData }">
              <router-link class="va-link link" :to="{ name: 'log-details', params: { id: rowData._from_id } }">
                {{ dateFormatUTC(rowData._from_time) }}
              </router-link>
            </template>
            <template #cell(stayed_at)="{ rowData }">
              <div v-if="rowData.stay_code" style="max-width: 150px">
                <StayAt
                  :id="parseInt(rowData.id)"
                  :key="rowData.id"
                  :data="parseInt(rowData.stay_code)"
                  @clickFromChildComponent="updateDefaultStay"
                />
              </div>
            </template>
            <template #cell(duration)="{ rowData }">
              {{ durationFormatDays(rowData.duration) }} {{ $t('stays.stay.duration_unit') }}
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
  import { dateFormatUTC, durationFormatDays } from '../../utils/dateFormatter.js'
  import StayAt from '../../components/SelectStayAt.vue'
  import { useRoute } from 'vue-router'

  //import staysMoorageData from '../../data/staysMoorage.json'

  const { t } = useI18n()
  const getDefaultFilter = () => {
    return {
      name: null,
      dateRange: null,
    }
  }

  const route = useRoute()
  const CacheStore = useCacheStore()
  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const perPage = ref(20)
  const currentPage = ref(1)
  const columns = ref([
    { key: 'arrived', label: t('stays.moorage.arrived'), sortable: true },
    { key: 'departed', label: t('stays.moorage.departed'), sortable: true },
    { key: 'stayed_at', label: t('stays.moorage.stayed_at'), sortable: true },
    { key: 'duration', label: t('stays.moorage.duration'), sortable: true },
  ])
  const filter = reactive(getDefaultFilter())

  const items = computed(() => {
    return Array.isArray(rowsData.value) ? rowsData.value : []
  })

  const pages = computed(() => {
    return Math.ceil(items.value.length / perPage.value)
  })
  // TODO Default sort on duration
  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.moorages_stays(id)
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
        console.log('Moorages Stays List rowsData:', rowsData.value)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      /*
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...staysMoorageData)
      }
      */
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
