<template>
  <template v-if="!rowsData.length > 0">
    <nodatayet />
  </template>
  <template v-else>
    <div>
      <va-card class="mb-3">
        <va-card-content>
          <Map style="width: 100%; height: 40vh" :map-zoom="12" :moorage-map-id="Number.parseInt(route.params.id)" />
        </va-card-content>
      </va-card>
      <va-card class="mb-3">
        <va-card-content>
          <div class="layout gutter--md">
            <div class="py-2 grid grid-cols-12 gap-6">
              <div class="col-span-12 md:col-span-6 flex flex-col">
                <va-date-input
                  v-model="filter.dateRange"
                  :clearable="true"
                  placeholder="Filter by date range..."
                  mode="range"
                />
              </div>
              <div class="col-span-12 md:col-span-6 flex flex-col">
                <VaSelect v-model="filter.stayed_at" placeholder="Filter by stay type..." :options="options" multiple>
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
            v-model:sort-by="sorting.sortBy"
            v-model:sorting-order="sorting.sortingOrder"
            :columns="columns"
            :items="items"
            :loading="isBusy"
            :per-page="perPage"
            :current-page="currentPage"
            striped
            hoverable
            class="datatable"
          >
            <template #cell(arrived)="{ value, rowData }">
              <router-link class="va-link link" :to="{ name: 'log-details', params: { id: rowData.arrived_id } }">
                {{ dateFormatUTC(value) }}
              </router-link>
            </template>
            <template #cell(departed)="{ value, rowData }">
              <router-link class="va-link link" :to="{ name: 'log-details', params: { id: rowData.departed_id } }">
                {{ dateFormatUTC(value) }}
              </router-link>
            </template>
            <template #cell(stayed_at)="{ rowData }">
              <div v-if="rowData.stayed_at_id" style="max-width: 150px">
                <StayAt
                  :id="parseInt(rowData.id)"
                  :key="rowData.id"
                  :data="parseInt(rowData.stayed_at_id)"
                  @clickFromChildComponent="updateDefaultStay"
                />
              </div>
            </template>
            <template #cell(duration)="{ value }"> {{ value }} </template>
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
          </div>
        </va-card-content>
      </va-card>
    </div>
  </template>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { areIntervalsOverlapping } from 'date-fns'
  import { useI18n } from 'vue-i18n'
  import { useCacheStore } from '../../stores/cache-store'
  import PostgSail from '../../services/api-client'
  import Map from '../../components/maps/leafletMapMoorages.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import nodatayet from '../../components/noDataScreen.vue'
  import { default as utils } from '../../utils/utils.js'
  import { dateFormatUTC, durationFormatDays } from '../../utils/dateFormatter.js'
  import StayAt from '../../components/SelectStayAt.vue'
  import { getTextForStayId } from '../../components/SelectStayAt.vue'
  import { useRoute } from 'vue-router'
  import { stayed_at_options } from '../../utils/PostgSail.ts'

  //import staysMoorageData from '../../data/staysMoorage.json'

  const { t } = useI18n()
  const getDefaultFilter = () => {
    return {
      dateRange: null,
      stayed_at: [],
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
    {
      key: 'duration',
      label: t('stays.moorage.duration_d'),
      sortable: true,
      sortingFn: utils.sortNum,
      tdAlign: 'right',
    },
  ])
  const sorting = ref({ sortBy: 'departed', sortingOrder: 'desc' })
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
    filter.stayed_at = filter.stayed_at.filter((v) => v !== chip)
  }

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value
          .map((row) => ({
            id: row.id,
            arrived_id: row._to_id,
            arrived: row._to_time,
            departed_id: row._from_id,
            departed: row._from_time,
            stayed_at: getTextForStayId(row.stay_code),
            stayed_at_id: row.stay_code,
            duration: durationFormatDays(row.duration),
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
                case 'dateRange':
                  // TODO: temp fix for Vuestic date range bug
                  if (!f[fkey].start || !f[fkey].end) {
                    return true
                  }
                  return areIntervalsOverlapping({ start: new Date(row.arrived), end: new Date(row.departed) }, f[fkey])
                case 'stayed_at':
                  var valid = false
                  if (f['stayed_at'].length == 0) return true
                  for (let i = 0; i < f['stayed_at'].length; i++) {
                    if (!f['stayed_at'][i] || valid) {
                      continue
                    }
                    valid = row.stayed_at.toLowerCase().includes(f['stayed_at'][i].toLowerCase())
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
</script>

<style lang="scss">
  .va-table {
    width: 100%;
  }
</style>
