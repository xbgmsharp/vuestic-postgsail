<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.details.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <va-inner-loading :loading="isBusy">
          <div class="mb-3 my-3">
            <template v-if="!isBusy && item">
              <lMap :loading="isBusy" style="width: 100%; height: 250px" />
            </template>
          </div>
          <template v-if="item">
            <dl class="dl-details row">
              <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.name') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.name }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.mmsi') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.mmsi }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.last_contact') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.lastContact) }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.created_at') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.createdAt) }}</dd>
            </dl>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/postgsail.js'
  import { dateFormat } from '../../utils/dateFormater.js'
  import lMap from '../../components/maps/leafletMap.vue'

  import vesselsDatas from '../../data/vessel.json'

  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const apiData = reactive({ row: null })

  const item = computed(() => {
    return apiData.row
      ? {
          mmsi: apiData.row.mmsi,
          name: apiData.row.name,
          lastContact: apiData.row.last_contact,
          createdAt: apiData.row.created_at,
        }
      : {}
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const mmsi = route.params.mmsi
    try {
      const response = await api.vessel_get(mmsi)
      if (response.data) {
        apiData.row = response.data
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      apiError.value = response.data.message
      console.warn('Get data from json...', apiError.value)
      const row = vesselsDatas.find((row) => row.id == route.params.id)
      apiData.row = row
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss" scoped>
  .dl-details {
    > dt:nth-child(4n + 3) {
      &,
      & + dd {
        background-color: var(--va-background);
      }
    }
  }
</style>
