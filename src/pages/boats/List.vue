<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.list.title') }}</va-card-title>
      <va-card-content>
        <va-data-table :columns="columns" :items="items" :loading="isBusy" striped hoverable>
          <template #cell(name)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'boat-details', params: { mmsi: rowData.mmsi } }">
              {{ value }}
            </router-link>
          </template>
          <template #cell(lastContact)="{ value }">
            {{ dateFormat(value) }}
          </template>
          <template #cell(createdAt)="{ value }">
            {{ dateFormat(value) }}
          </template>
          <template #cell(actions)="{ rowData }">
            <va-button @click="handleGetToken(rowData.mmsi)">{{ $t('boats.boat.get_token') }}</va-button>
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
  import { defineComponent } from 'vue'
  import dateFormater from '../../mixins/dateFormater.js'
  import vesselsDatas from '../../data/vessel.json'
  export default defineComponent({
    mixins: [dateFormater],
    data() {
      return {
        isBusy: true,
        rowsData: null,
        perPage: 20,
        currentPage: 1,
        columns: [
          { key: 'name', label: this.$t('boats.boat.name'), sortable: true },
          { key: 'mmsi', label: this.$t('boats.boat.mmsi'), sortable: true },
          { key: 'lastContact', label: this.$t('boats.boat.last_contact'), sortable: true },
          { key: 'createdAt', label: this.$t('boats.boat.created_at'), sortable: true },
          { key: 'actions', label: '' },
        ],
      }
    },
    computed: {
      items() {
        return Array.isArray(this.rowsData)
          ? this.rowsData.map((row) => {
              return {
                name: row.name,
                mmsi: row.mmsi,
                lastContact: row.last_contact,
                createdAt: row.created_at,
              }
            })
          : []
      },
    },
    mounted() {
      this.isBusy = true
      window.setTimeout(() => {
        this.rowsData = [...vesselsDatas]
        this.isBusy = false
      }, 400)
    },
    methods: {
      handleGetToken(mmsi) {
        console.log('get token for', mmsi)
      },
    },
  })
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
