<template>
  <va-card>
    <va-card-title>{{ $t('boats.list.title') }}</va-card-title>
    <va-card-content>
      <template v-if="apiError">
        <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
      </template>
      <va-data-table :columns="columns" :items="items" :loading="isBusy" striped hoverable>
        <template #cell(name)="{ value, rowData }">
          <template v-if="vesselSuccess">
            <router-link class="font-bold" :to="{ name: 'boat-details', params: { name: rowData.name } }">
              {{ value }}
            </router-link>
          </template>
          <template v-else>
            {{ value }}
          </template>
        </template>
        <template #cell(lastContact)="{ value }">
          {{ value }}
        </template>
        <template #cell(createdAt)="{ value }">
          {{ value }}
        </template>
        <template #cell(actions)="{ rowData }">
          <GetBoatToken :item="rowData" />
        </template>
      </va-data-table>
      <template v-if="items.length > perPage">
        <div class="mt-3 row justify-center">
          <va-pagination v-model="currentPage" input :pages="pages" />
        </div>
      </template>
    </va-card-content>
  </va-card>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/postgsail.js'
  import GetBoatToken from './GetBoatToken.vue'
  import { dateFormatUTC } from '../../utils/dateFormater.js'

  import vesselsDatas from '../../data/boats.json'

  const { t, locale } = useI18n()
  const isBusy = ref(false)
  const vesselSuccess = ref(false)
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
          const { name, mmsi, last_contact, created_at } = row
          if (last_contact) {
            vesselSuccess.value = true
          }
          return {
            name: name,
            mmsi: mmsi,
            lastContact: last_contact ? dateFormatUTC(last_contact, locale.value) : 'Pending',
            createdAt: dateFormatUTC(created_at, locale.value),
          }
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
      const response = await api.vessels()
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          //console.warn('api.vessels() response...', response.data)
          rowsData.value.splice(0, rowsData.value.length || [])
          rowsData.value.push(...response.data)
        } else {
          console.warn('pending boat metadata?')
          const response = await api.vessels_pending()
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            rowsData.value.splice(0, rowsData.value.length || [])
            rowsData.value.push(...response.data)
          }
        }
      } else {
        throw {
          response: {
            data: { message: 'Wrong API response. Expected array, got ' + typeof response.data + '.' + response.data },
          },
        }
      }
    } catch ({ response }) {
      apiError.value = response.data.message
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample datas from local json...', apiError.value)
        rowsData.value.splice(0, vesselsDatas.length)
        rowsData.value.push(...vesselsDatas)
      }
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss" scoped></style>
