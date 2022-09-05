<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>{{ $t('logs.list.filter.title') }}</va-card-title>
      <va-card-content>
        <div class="layout gutter--md">
          <div class="row">
            <div class="flex xs6">
              <va-input v-model="filter.name" :label="$t('logs.list.filter.name')" placeholder="Filter by name..." />
            </div>
            <div class="flex xs6">
              <va-date-input
                v-model="filter.dateRange"
                :label="$t('logs.list.filter.date_range')"
                style="width: 100%"
                :readonly="false"
                mode="range"
              />
            </div>
            <div class="flex xs12">
              <div class="d-flex justify--end">
                <va-button icon="clear" outline @click="resetFilter">{{ $t('logs.list.filter.reset') }}</va-button>
              </div>
            </div>
          </div>
        </div>
      </va-card-content>
    </va-card>
    <va-card>
      <va-card-title>{{ $t('logs.list.title') }}</va-card-title>
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
          <template #cell(name)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'log-details', params: { id: rowData.id } }">
              {{ value }}
            </router-link>
          </template>
          <template #cell(fromTime)="{ value }">
            {{ dateFormat(value) }}
          </template>
          <template #cell(toTime)="{ value }">
            {{ dateFormat(value) }}
          </template>
          <template #cell(distance)="{ value }">
            {{ distanceFormat(value) }}
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
  import PostgSail from '../../services/postgsail.js'
  import { dateFormat, durationFormat } from '../../utils/dateFormater.js'
  import { distanceFormat } from '../../utils/distanceFormater.js'

  import logsDatas from '../../data/logs.json'

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
    { key: 'name', label: t('logs.log.name'), sortable: true },
    { key: 'from', label: t('logs.log.from'), sortable: true },
    { key: 'to', label: t('logs.log.to'), sortable: true },
    { key: 'fromTime', label: t('logs.log.from_time'), sortable: true },
    { key: 'toTime', label: t('logs.log.to_time'), sortable: true },
    { key: 'distance', label: t('logs.log.distance'), sortable: true },
    { key: 'duration', label: t('logs.log.duration'), sortable: true },
  ])
  const filter = reactive(getDefaultFilter())

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value
          .map((row) => ({
            id: row.id,
            name: row.Name,
            from: row.From,
            to: row.To,
            fromTime: row.Started,
            toTime: row.Ended,
            distance: row.Distance,
            duration: row.Duration,
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
                  return areIntervalsOverlapping({ start: new Date(row.fromTime), end: new Date(row.toTime) }, f[fkey])
              }
            })
          })
      : []
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.logs()
      if (response.data && Array.isArray(response.data) && response.data[0]) {
        rowsData.value.splice(0, rowsData.value.length)
        rowsData.value.push(...response.data)
      } else {
        throw {
          response: { data: { message: 'Wrong API response. Expected array, got ' + typeof response.data + '.' } },
        }
      }
    } catch ({ response }) {
      apiError.value = response.data.message
      console.warn('Get datas from json...', apiError.value)
      rowsData.value.splice(0, rowsData.value.length)
      rowsData.value.push(...logsDatas)
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
