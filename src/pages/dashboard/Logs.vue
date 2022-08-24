<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.list.title') }}</va-card-title>
      <va-data-table :columns="columns" :items="items" no-pagination>
        <template #cell(actions)="{ rowIndex }">
          <va-button flat icon="eye" @click="openDetails(rowIndex)" />
        </template>
      </va-data-table>
    </va-card>
  </div>
</template>

<script>
  import { defineComponent } from 'vue'
  import logsDatas from '../../data/logs.json'
  export default defineComponent({
    data() {
      return {
        items: logsDatas.logs_view,
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: '_from', label: 'From', sortable: true },
          { key: '_from_time', label: 'From time', sortable: true },
          { key: '_to', label: 'To', sortable: true },
          { key: '_to_time', label: 'To time', sortable: true },
          { key: 'actions', label: '' },
        ],
      }
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
