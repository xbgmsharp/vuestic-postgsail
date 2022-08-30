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

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/postgsail.js'
  import GetBoatToken from './GetBoatToken.vue'
  import { dateFormat } from '../../utils/dateFormater.js'

  import vesselsDatas from '../../data/vessel.json'

  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const perPage = ref(20)
  const currentPage = ref(1)
  const columns = ref([
    { key: 'name', label: t('boats.boat.name'), sortable: true },
    { key: 'mmsi', label: t('boats.boat.mmsi'), sortable: true },
    { key: 'lastContact', label: t('boats.boat.last_contact'), sortable: true },
    { key: 'createdAt', label: t('boats.boat.created_at'), sortable: true },
    { key: 'actions', label: '' },
  ])
  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value.map((row) => {
          return {
            name: row.name,
            mmsi: row.mmsi,
            lastContact: row.last_contact,
            createdAt: row.created_at,
          }
        })
      : []
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.vessel_get()
      if (response.data) {
        rowsData.value.splice(0, rowsData.value.length)
        rowsData.value.push(...response.data)
      } else {
        throw { response }
      }
    } catch ({ response }) {
      apiError.value = response.data.message
      console.warn('Get datas from json...', apiError.value)
      rowsData.value.splice(0, rowsData.value.length)
      rowsData.value.push(...vesselsDatas)
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
