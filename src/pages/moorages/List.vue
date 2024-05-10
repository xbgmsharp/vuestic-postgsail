<template>
  <template v-if="!rowsData.length > 0">
    <nodatayet />
  </template>
  <template v-else>
    <div>
      <va-card class="mb-3">
        <va-card-title>{{ title }}</va-card-title>
        <va-card-content>
          <template v-if="apiError">
            <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
          </template>
          <div class="layout flex flex-col lg:flex-row gap-4 justify-between">
            <va-input v-model="filter.name" :clearable="true" placeholder="Filter by name..." />
            <va-select
              v-model="filter.default_stay"
              placeholder="Filter by default stay type..."
              :options="options"
              multiple
              text-by="text"
            >
              <template #content="{ value }">
                <va-chip
                  v-for="chip in value"
                  :key="chip.text"
                  size="small"
                  class="mr-2"
                  closeable
                  @update:modelValue="deleteChip(chip)"
                >
                  {{ chip }}
                </va-chip>
              </template>
            </va-select>
          </div>
          <va-data-table
            v-model:sort-by="sorting.sortBy"
            v-model:sorting-order="sorting.sortingOrder"
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
                {{ value }}
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
  import { setAppTitle } from '../../utils/app.js'
  import PostgSail from '../../services/api-client'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import nodatayet from '../../components/noDataScreen.vue'
  import StayAt from '../../components/SelectStayAt.vue'
  import { stayed_at_options } from '../../utils/PostgSail.ts'
  import { durationFormatDays } from '../../utils/dateFormatter.js'
  import { useVesselStore } from '../../stores/vessel-store'

  const { vesselName, vesselType } = useVesselStore()

  import mooragesData from '../../data/moorages.json'

  const { t } = useI18n()
  const getDefaultFilter = () => {
    return {
      name: null,
      default_stay: [],
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
    { key: 'total_stay', label: t('moorages.list.total_stay'), sortable: true, tdAlign: 'right' },
    { key: 'arrivals_departures', label: t('moorages.list.arrivals'), sortable: true, tdAlign: 'right' },
  ])
  const sorting = ref({ sortBy: 'total_stay', sortingOrder: 'desc' })
  const filter = reactive(getDefaultFilter())
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
    filter.default_stay = filter.default_stay.filter((v) => v !== chip)
  }

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value
          .map((row) => ({
            id: row.id,
            moorage: row.moorage,
            default_stay: row.default_stay,
            default_stay_id: row.default_stay_id,
            total_stay: durationFormatDays(row.total_duration),
            arrivals_departures: row.arrivals_departures,
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
                  var valid = false
                  if (f['default_stay'].length == 0) return true
                  for (let i = 0; i < f['default_stay'].length; i++) {
                    if (!f['default_stay'][i] || valid) {
                      continue
                    }
                    valid = row.default_stay.toLowerCase().includes(f['default_stay'][i].toLowerCase())
                  }
                  return valid
              }
            })
          })
      : []
  })

  const pages = computed(() => {
    return Math.ceil(items.value.length / perPage.value)
  })

  const title = t('moorages.list.title') + ' ' + vesselName

  onMounted(async () => {
    document.title = setAppTitle(title)
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
          CacheStore.resetCache()
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

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
