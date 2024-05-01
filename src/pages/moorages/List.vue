<template>
  <template v-if="!rowsData.length > 0">
    <nodatayet />
  </template>
  <template v-else>
    <div>
      <va-card class="mb-3">
        <va-card-content>
          <div class="layout gutter--md">
            <div class="py-2 grid grid-cols-12 gap-6">
              <div class="col-span-12 md:col-span-6 flex flex-col">
                <va-input v-model="filter.name" :clearable="true" placeholder="Filter by name..." />
              </div>
              <div class="col-span-12 md:col-span-6 flex flex-col">
                <va-input
                  v-model="filter.default_stay"
                  :clearable="true"
                  placeholder="Filter by default stay type..."
                />
              </div>

              <div class="col-span-12 md:col-span-6 flex flex-col">
                <VaSelect
                  v-model="filterstayed_at"
                  placeholder="Filter by default stay type..."
                  :options="options"
                  multiple
                  text-by="text"
                >
                  <template #content="{ value }">
                    <VaChip
                      v-for="chip in value"
                      :key="chip.text"
                      size="small"
                      class="mr-2"
                      closeable
                      @update:modelValue="deleteChip(chip)"
                    >
                      {{ chip }}
                    </VaChip>
                  </template>
                </VaSelect>
              </div>
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
              <router-link class="va-link link" :to="{ name: 'moorage-details', params: { id: rowData.id } }">
                {{ value }}
              </router-link>
            </template>
            <template #cell(default_stay)="{ rowData }">
              <div v-if="rowData.default_stay_id" style="max-width: 150px">
                <StayAt
                  :id="parseInt(rowData.id)"
                  :key="rowData.id"
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
            <template #cell(total_stay)="{ value, rowData }">
              <router-link class="va-link link" :to="{ name: 'moorage-stays', params: { id: rowData.id } }">
                {{ $t('units.time.days', parseInt(value)) }}
              </router-link>
            </template>
            <template #cell(arrivals_departures)="{ value, rowData }">
              <router-link
                class="va-link link"
                :to="{ name: 'moorage-arrivals-departures', params: { id: rowData.id } }"
              >
                {{ value }}
              </router-link>
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
  import { stayed_at_options } from '../../utils/PostgSail.ts'
  import mooragesData from '../../data/moorages.json'

  const { t } = useI18n()
  const getDefaultFilter = () => {
    return {
      name: null,
      stay: null,
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
  const filterstayed_at = ref([])
  const options = computed(() => {
    let arr = []
    for (let key in stayed_at_options) {
      //console.log(key)
      arr.push(stayed_at_options[key].text)
    }
    //console.log(arr)
    return arr
  })

  function deleteChip(chip) {
    filterstayed_at.value = filterstayed_at.value.filter((v) => v !== chip)
  }

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

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
