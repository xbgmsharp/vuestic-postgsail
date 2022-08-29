<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>{{ $t('logs.list.filter.title') }}</va-card-title>
      <va-card-content>
        <div class="layout gutter--md">
          <div class="row">
            <div class="flex md6">
              <va-input v-model="filter.name" :label="$t('logs.list.filter.name')" placeholder="Filter by name..." />
            </div>
            <div class="flex md6">
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

<script>
  import { areIntervalsOverlapping } from 'date-fns'
  import PostgSail from '../../services/postgsail.js'
  import dateFormater from '../../mixins/dateFormater.js'
  import distanceFormater from '../../mixins/distanceFormater.js'
  import { defineComponent } from 'vue'
  import logsDatas from '../../data/logs.json'
  const getDefaultFilter = () => {
    return {
      name: null,
      dateRange: null,
    }
  }
  export default defineComponent({
    mixins: [dateFormater, distanceFormater],
    data() {
      return {
        isBusy: false,
        rowsData: [],
        perPage: 20,
        currentPage: 1,
        columns: [
          { key: 'name', label: this.$t('logs.log.name'), sortable: true },
          { key: 'from', label: this.$t('logs.log.from'), sortable: true },
          { key: 'to', label: this.$t('logs.log.to'), sortable: true },
          { key: 'fromTime', label: this.$t('logs.log.from_time'), sortable: true },
          { key: 'toTime', label: this.$t('logs.log.to_time'), sortable: true },
          { key: 'distance', label: this.$t('logs.log.distance'), sortable: true },
          { key: 'duration', label: this.$t('logs.log.duration'), sortable: true },
        ],
        filter: getDefaultFilter(),
      }
    },
    computed: {
      items() {
        return Array.isArray(this.rowsData)
          ? this.rowsData
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
                const f = this.filter
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
                      return areIntervalsOverlapping(
                        { start: new Date(row.fromTime), end: new Date(row.toTime) },
                        f[fkey],
                      )
                  }
                })
              })
          : []
      },
    },
    async mounted() {
      this.isBusy = true
      window.setTimeout(() => {
        this.rowsData = [...logsDatas]
        this.isBusy = false
      }, 400)
      /*const post = new PostgSail()
      post
        .logs_view()
        .then((response) => {
          console.log('logs_view', response)
        })
        .catch((error) => {
          console.log(error)
          this.errored = true
        })
        .finally(() => (this.isBusy = false))*/
    },
    methods: {
      resetFilter() {
        this.filter = { ...getDefaultFilter() }
      },
    },
  })
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
