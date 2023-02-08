<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>{{ $t('stays.list.filter.title') }}</va-card-title>
      <va-card-content>
        <div class="layout gutter--md">
          <div class="row">
            <div class="flex xs6">
              <va-input v-model="filter.name" :label="$t('stays.list.filter.name')" placeholder="Filter by name..." />
            </div>
            <div class="flex xs6">
              <va-date-input
                v-model="filter.dateRange"
                :label="$t('stays.list.filter.date_range')"
                style="width: 100%"
                :readonly="false"
                mode="range"
              />
            </div>
            <div class="flex xs12">
              <div class="d-flex justify--end">
                <va-button icon="clear" outline @click="resetFilter">{{ $t('stays.list.filter.reset') }}</va-button>
              </div>
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
        >
          <template #cell(name)="{ value }">
            <!--
              <template #cell(name)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'stay-details', params: { id: rowData.id } }">
              {{ value }}
            </router-link>
            -->
            {{ value }}
          </template>
          <template #cell(moorage)="{ value }">
            {{ value }}
          </template>
          <template #cell(arrived)="{ value }">
            {{ value }}
          </template>
          <template #cell(departed)="{ value }">
            {{ value }}
          </template>
          <template #cell(stayed_at)="{ value }">
            {{ value }}
          </template>
          <template #cell(duration)="{ value }">
            {{ durationFormat(value) }} {{ $t('logs.log.duration_unit') }}
          </template>
        </va-data-table>
        <template v-if="items.length > perPage">
          <div class="mt-3 row justify--center">
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
  //import { useCacheStore } from '../../stores/cache-store'
  import PostgSail from '../../services/postgsail.js'
  import { dateFormat, durationFormat } from '../../utils/dateFormater.js'
  import { distanceFormat } from '../../utils/distanceFormater.js'

  import staysDatas from '../../data/stays.json'

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
      ? rowsData.value
          .map((row) => ({
            id: row.id,
            name: row.name,
            moorage: row.moorage,
            arrived: row.arrived,
            departed: row.departed,
            stayed_at: row.stayed_at,
            duration: row.duration,
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
    const api = new PostgSail()
    try {
      const response = await api.stays()
      rowsData.value.splice(0, rowsData.value.length || [])
      rowsData.value.push(...response.data)
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
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
