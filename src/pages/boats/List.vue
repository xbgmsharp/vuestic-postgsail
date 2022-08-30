<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.list.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
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
            <GetBoatToken :item="rowData" />
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
  import { defineComponent } from 'vue'
  import GetBoatToken from './GetBoatToken.vue'
  import dateFormater from '../../mixins/dateFormater.js'
  import vesselsDatas from '../../data/vessel.json'
  export default defineComponent({
    components: { GetBoatToken },
    mixins: [dateFormater],
    data() {
      return {
        isBusy: true,
        apiError: null,
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
    async mounted() {
      this.isBusy = true
      this.apiError = null
      try {
        const api = new PostgSail()
        const response = await api.vessel_get()
        if (response.data) {
          this.rowsData = response.data
        } else {
          throw { response }
        }
      } catch ({ response }) {
        this.apiError = response.data.message
        console.warn('Get data from json...', this.apiError)
        this.rowsData = [...vesselsDatas]
      } finally {
        this.isBusy = false
      }
    },
  })
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
