<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.list.title') }}</va-card-title>
      <va-card-content>
        <va-data-table
          :columns="columns"
          :items="items"
          :loading="isBusy"
          :per-page="perPage"
          :current-page="currentPage"
          stripped
        >
          <template #cell(name)="{ value, rowIndex }">
            <router-link class="text--bold" :to="{ name: 'log', params: { id: rowIndex } }">
              {{ value }}
            </router-link>
          </template>
          <template #cell(_from_time)="{ value }">
            {{ dateFormat(value) }}
          </template>
          <template #cell(_to_time)="{ value }">
            {{ dateFormat(value) }}
          </template>
          <template #cell(distance)="{ value }">
            {{ value }} {{ ($t('logs.log.distance_unit'), Number(value)) }}
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
  import PostgSail from '../../services/postgsail.js'
  import dateFormater from '../../mixins/dateFormater.js'
  import { defineComponent } from 'vue'
  import logsDatas from '../../data/logs.json'
  export default defineComponent({
    mixins: [dateFormater],
    data() {
      return {
        isBusy: false,
        items: [],
        perPage: 20,
        currentPage: 1,
        columns: [
          { key: 'name', label: this.$t('logs.log.name'), sortable: true },
          { key: '_from', label: this.$t('logs.log.from'), sortable: true },
          { key: '_to', label: this.$t('logs.log.to'), sortable: true },
          { key: '_from_time', label: this.$t('logs.log.from_time'), sortable: true },
          { key: '_to_time', label: this.$t('logs.log.to_time'), sortable: true },
          { key: 'distance', label: this.$t('logs.log.distance'), sortable: true },
          { key: 'duration', label: this.$t('logs.log.duration'), sortable: true },
        ],
      }
    },
    computed: {},
    async mounted() {
      this.isBusy = true
      window.setTimeout(() => {
        this.items = [...logsDatas]
        this.isBusy = false
      }, 400)
      const post = new PostgSail()
      post
        .logs_view()
        .then((response) => {
          console.log('logs_view', response)
        })
        .catch((error) => {
          console.log(error)
          this.errored = true
        })
        .finally(() => (this.isBusy = false))
    },
    methods: {
      openDetails(id) {
        console.log(id)
        this.$router.push({ name: 'log-details', params: { id } })
      },
    },
  })
</script>

<style lang="scss">
  .markup-tables {
    .table-wrapper {
      overflow: auto;
    }

    .va-table {
      width: 100%;
    }
  }
</style>
