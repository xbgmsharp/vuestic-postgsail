<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.list.title') }}</va-card-title>
      <va-card-content>
        <va-data-table :columns="columns" :items="items" no-pagination>
          <template #cell(name)="{ value, rowData }">
            <router-link class="text--bold" :to="{ name: 'boat-details', params: { mmsi: rowData.mmsi } }">
              {{ value }}
            </router-link>
          </template>
          <template #cell(last_contact)="{ value }">
            {{ dateFormat(value) }}
          </template>
        </va-data-table>
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
        isBusy: false,
        items: [],
        perPage: 20,
        currentPage: 1,
        columns: [
          { key: 'name', label: this.$t('boats.boat.name'), sortable: true },
          { key: 'mmsi', label: this.$t('boats.boat.mmsi'), sortable: true },
          { key: 'last_contact', label: this.$t('boats.boat.last_contact'), sortable: true },
        ],
      }
    },
    mounted() {
      this.isBusy = true
      window.setTimeout(() => {
        this.items = [vesselsDatas]
        this.isBusy = false
      }, 400)
    },
  })
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
