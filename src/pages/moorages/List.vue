<template>
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
            </div>
            <!--<div class="flex xs12">
              <div class="flex flex-row-reverse justify-center">
                <va-button icon="clear" outline @click="resetFilter">{{ $t('moorages.list.filter.reset') }}</va-button>
              </div>
            </div>-->
            <va-button icon="clear" outline style="grid-column: 1 / 3; margin-right: auto" @click="resetFilter">{{
              $t('moorages.list.filter.reset')
            }}</va-button>
            <va-icon
              name="csv"
              outline
              :size="34"
              style="grid-column-end: 11"
              @click="runBusy(handleCSV, items, 'moorages')"
            ></va-icon>
            <va-icon name="gpx" outline :size="34" style="grid-column-end: 12" @click="runBusy(handleGPX)"></va-icon>
            <va-icon
              name="geojson"
              outline
              :size="34"
              style="grid-column-end: 13"
              @click="runBusy(handleGeoJSON)"
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
          <!--
          <template #cell(moorage)="{ value }">
            {{ value }}
          </template>
          -->
          <template #cell(moorage)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
              {{ value }}
            </router-link>
          </template>
          <template #cell(default_stay)="{ value }">
            <div style="max-width: 150px">
              <va-select
                v-model="stayed_at[value]"
                :placeholder="value"
                :options="stayed_at"
                outline
                style="max-width: 150px"
                class="mb-6"
                @update:modelValue="updateDefaultStay(rowData.id, $event)"
              />
            </div>
          </template>
          <template #cell(total_stay)="{ value }"> {{ value }} {{ $t('moorages.list.duration_unit') }} </template>
          <template #cell(arrivals)="{ value }">
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

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCacheStore } from '../../stores/cache-store'
  import PostgSail from '../../services/api-client'
  import Map from '../../components/maps/leafletMapMoorages.vue'
  import { asBusy, handleCSV, handleGPX, handleGeoJSON } from '../../utils/handleExports'

  import mooragesDatas from '../../data/moorages.json'

  const stayed_at = ref(['Unknown', 'Anchor', 'Mooring Buoy', 'Dock'])

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
    { key: 'moorage', label: t('moorages.list.moorage'), sortable: true },
    { key: 'default_stay', label: t('moorages.list.default_stay'), sortable: true },
    { key: 'total_stay', label: t('moorages.list.total_stay'), sortable: true },
    { key: 'arrivals', label: t('moorages.list.arrivals'), sortable: true },
  ])
  const filter = reactive(getDefaultFilter())

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value
          .map((row) => ({
            id: row.id,
            moorage: row.moorage,
            default_stay: row.default_stay,
            total_stay: row.total_stay,
            arrivals: row.arrivals_departures,
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
    //const api = new PostgSail()
    try {
      //const response = await api.moorages()
      const response = await useCacheStore().getAPI('moorages')
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
        rowsData.value.push(...mooragesDatas)
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

  const updateDefaultStay = async (id, update_stayed_at) => {
    console.log('updateDefaultStay', id, update_stayed_at)
    /*if (update_stayed_at) {
      isBusy.value = true
      apiError.value = null
      const api = new PostgSail()
      const payload = {
        default_stay: update_stayed_at,
      }
      try {
        const response = api.moorage_update(id, payload)
        if (response) {
          console.log('updateDefaultStay success', response)
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
    }*/
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
</script>

<style lang="scss">
  .va-table {
    width: 100%;
  }
  .leaflet-maps-page {
    display: flex;
    flex-direction: column;

    .va-alert {
      flex: 0 0 auto;
      width: 100%;
    }

    .leaflet-maps-page__widget {
      flex: 1 1 auto;

      .leaflet-map {
        height: 100% !important;
      }
    }
  }
</style>
