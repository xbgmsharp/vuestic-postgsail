<template>
  <div>
    <va-card class="mb-3">
      <va-card-content>
        <Map style="height: 30vh" />
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
            <div class="flex xs12">
              <div class="flex flex-row-reverse justify-center">
                <va-button icon="clear" outline @click="resetFilter">{{ $t('moorages.list.filter.reset') }}</va-button>
              </div>
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
          <template #cell(moorage)="{ value }">
            <!--
              <template #cell(name)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'stay-details', params: { id: rowData.id } }">
              {{ value }}
            </router-link>
            -->
            {{ value }}
          </template>
          <template #cell(default_stay)="{ value }">
            {{ value }}
            <!--
            <div style="max-width: 150px;">
              <va-select class="mb-6" v-model="stayed_at[value]" :options="stayed_at" />
            </div>
            -->
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
  import Map from './Map.vue'

  import mooragesDatas from '../../data/moorages.json'

  const stayed_at = ref(['Unknow', 'Anchor', 'Mooring Buoy', 'Dock'])

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
    const api = new PostgSail()
    try {
      const response = await api.moorages()
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
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
