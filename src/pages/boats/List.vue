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
        <template #cell(status)="{ value, rowData }">
          <va-popover class="mr-2 mb-2" icon="error" :message="rowData.message">
            <template v-if="value == 0"> <va-avatar size="small" color="warning" class="mr-6" /> Offline </template>
            <template v-else-if="value == 1"> <va-avatar size="small" color="success" class="mr-6" /> Online </template>
          </va-popover>
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

    <va-card-content>
      <div
        class="sm:min-h-[114px] p-4 rounded-lg border border-dashed border-primary flex flex-col sm:flex-row items-start sm:items-center gap-4"
        :style="{ backgroundColor: colorToRgba(getColor('primary'), 0.07) }"
      >
        <div class="flex flex-col gap-2 flex-grow">
          <div class="text-lg font-bold leading-relaxed">Important note</div>
          <div class="text-secondary text-sm leading-tight">
            PostgSail Cloud is free for personal use with a single vessel. If wish to manage multiple boats contact
            us.<br />
            You can create public or private fleets for your friends, cruising clubs, yacht clubs or flotillas. Please
            contact us at info@openplotter.cloud.
          </div>
        </div>
        <a
          href="mailto:info@openplotter.cloud?subject=PostgSail Cloud&body=How do we proceed to create public or private fleets for your friends, cruising clubs, yacht clubs or flotillas."
          target="_blank"
        >
          <VaButton class="flex-none w-full sm:w-auto">Contact us</VaButton></a
        >
      </div>
    </va-card-content>
  </va-card>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import GetBoatToken from './GetBoatToken.vue'
  import { dateFormatUTC, fromNow } from '../../utils/dateFormatter.js'
  import { useColors } from 'vuestic-ui'

  import vesselsData from '../../data/boats.json'

  const { getColor, colorToRgba } = useColors()
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
    { key: 'status', label: t('boats.boat.status'), sortable: true },
    { key: 'lastContact', label: t('boats.boat.last_contact'), sortable: true },
    { key: 'createdAt', label: t('boats.boat.created_at'), sortable: true },
    { key: 'actions', label: '' },
  ])
  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value.map((row) => {
          const { name, mmsi, last_contact, created_at, offline } = row
          if (last_contact) {
            vesselSuccess.value = true
          }
          let status = 0
          let msg = ''
          if (offline === null) {
            status = 0
          } else if (offline) {
            status = 0
            msg = t('boats.messages.offline', [fromNow(last_contact)])
          } else {
            status = 1
            msg = t('boats.messages.online', [fromNow(last_contact)])
          }
          console.log(msg)
          return {
            name: name,
            mmsi: mmsi,
            status: status,
            lastContact: last_contact ? dateFormatUTC(last_contact) : 'Pending',
            createdAt: dateFormatUTC(created_at),
            message: last_contact ? msg : t('boats.messages.pending'),
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
      if (Array.isArray(response)) {
        if (response.length > 0) {
          //console.warn('api.vessels() response...', response)
          rowsData.value.splice(0, rowsData.value.length || [])
          rowsData.value.push(...response)
        } else {
          console.warn('pending boat metadata?')
          const response = await api.vessels_pending()
          if (Array.isArray(response) && response.length > 0) {
            rowsData.value.splice(0, rowsData.value.length || [])
            rowsData.value.push(...response)
          }
        }
      } else {
        throw {
          response: { message: 'Wrong API response. Expected array, got ' + typeof response + '.' + response },
        }
      }
    } catch ({ response }) {
      apiError.value = response.message
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        rowsData.value.splice(0, vesselsData.length)
        rowsData.value.push(...vesselsData)
      }
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss" scoped>
  .va-data-table {
    overflow-x: auto;
  }
</style>
