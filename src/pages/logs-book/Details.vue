<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.details.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <div class="mb-3 my-3">
          <template v-if="!isBusy && item">
            <lMap :geo-json-features="mapGeoJsonFeatures" style="width: 100%; height: 350px" />
          </template>
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="formData.isValid = $event">
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.name') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input
                    v-model="formData.name"
                    placeholder="Name"
                    outline
                    :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                  />
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.from') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.from }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.from_time') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.fromTime) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.to') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.to }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.to_time') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.toTime) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.duration') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.duration }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.distance') }}</dt>
                <dd class="xs12 md6 pa-2">
                  {{ distanceFormat(item.distance) }} (<router-link
                    v-if="typeof item.id !== 'undefined'"
                    class="va-text-bold"
                    :to="{ name: 'timelapse', params: { id: item.id } }"
                  >
                    timelapse </router-link
                  >)
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">Average / Max Speed</dt>
                <dd class="flex xs12 md6 pa-2">
                  {{ speedFormat(item.avg_speed) }} / {{ speedFormat(item.max_speed) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">Max Wind Speed</dt>
                <dd class="flex xs12 md6 pa-2">{{ speedFormat(item.max_wind_speed) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.note') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input v-model="formData.notes" outline type="textarea" placeholder="Note" />
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.export') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-icon name="gpx" :size="44" @click="handleGPX" />
                  <va-icon name="geojson" :size="44" @click="handleGeoJSON" />
                </dd>
              </dl>
              <template v-if="updateError">
                <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</va-alert>
              </template>
              <div class="row justify-end">
                <div class="flex">
                  <!--
                  <va-button color="danger" @click="handleDelete">Delete</va-button>
                  -->
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
                </div>
              </div>
            </va-form>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/api-client'
  import { useCacheStore } from '../../stores/cache-store'
  import { dateFormat, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { speedFormat } from '../../utils/speedFormatter.js'
  import lMap from '../../components/maps/leafletMap.vue'

  import logsBooks from '../../data/logbook.json'

  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const updateError = ref(null)
  const apiData = reactive({ row: null })
  const formData = reactive({
    isValid: true,
    name: null,
    notes: null,
  })

  const item = computed(() => {
    return apiData.row
      ? {
          id: apiData.row.id,
          name: apiData.row.Name,
          from: apiData.row.From,
          fromTime: apiData.row.Started,
          to: apiData.row.To,
          toTime: apiData.row.Ended,
          distance: apiData.row.Distance,
          duration: apiData.row.Duration,
          notes: apiData.row.Notes,
          geoJson: apiData.row.geojson,
          avg_speed: apiData.row.avg_speed,
          max_speed: apiData.row.max_speed,
          max_wind_speed: apiData.row.max_wind_speed,
        }
      : {}
  })
  const mapGeoJsonFeatures = computed(() => {
    return item.value && item.value.geoJson && item.value.geoJson.features && Array.isArray(item.value.geoJson.features)
      ? item.value.geoJson.features
      : []
  })
  const canSubmit = computed(() => {
    const isDirty = item.value.name !== formData.name || item.value.notes !== formData.notes
    return !isBusy.value && formData.isValid && isDirty
  })
  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const CacheStore = useCacheStore()
    const id = route.params.id
    try {
      const response = await CacheStore.getAPI('log_get', id)
      apiData.row = response[0]
      formData.name = apiData.row.Name || null
      formData.notes = apiData.row.Notes || null
    } catch (e) {
      apiError.value = e
      console.warn('Get data from json...', apiError.value)
      const row = logsBooks.find((row) => row.id == route.params.id)
      apiData.row = row
    } finally {
      isBusy.value = false
    }
  })

  const handleSubmit = async () => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      name: formData.name,
      notes: formData.notes,
    }
    try {
      const response = await api.log_update(id, payload)
      if (response.ok) {
        console.log('log_update success', response.status)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_update failed', response)
      updateError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }

  const handleDelete = async () => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      name: formData.name,
      notes: formData.notes,
    }
    try {
      const response = await api.log_delete(id)
      if (response.data) {
        console.log('log_delete success', response.data)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_delete failed', response)
      updateError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }

  const handleGPX = async () => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      _id: id,
    }
    try {
      const response = await api.log_export_gpx(payload)
      if (response.data) {
        console.log('log_export_gpx success', response.data)
        const blob = new Blob([response.data], { type: 'text/xml' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `log_${id}.xml`
        link.click()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_export_gpx failed', response)
      updateError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }

  const handleGeoJSON = async () => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      _id: id,
    }
    try {
      const response = await api.log_export_geojson(payload)
      if (response.data) {
        console.log('log_export_geojson success', response.data)
        const jsonse = JSON.stringify(response.data.geojson)
        const blob = new Blob([jsonse], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `log_${id}.geojson`
        link.click()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_export_geojson failed', response)
      updateError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }
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
