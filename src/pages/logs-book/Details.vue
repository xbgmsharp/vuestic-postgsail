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
            <lMap :geo-json-features="mapGeoJsonFeatures" style="width: 100%; height: 250px" />
          </template>
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="formData.isValid = $event">
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 text--bold">Name</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input
                    v-model="formData.name"
                    placeholder="Name"
                    outline
                    :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                  />
                </dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Departed</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.from }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Departed at</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.fromTime) }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Arrived</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.to }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Arrived at</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.toTime) }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Duration</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.duration }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Distance</dt>
                <dd class="flex xs12 md6 pa-2">{{ distanceFormat(item.distance) }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Average / Max Speed</dt>
                <dd class="flex xs12 md6 pa-2">
                  {{ speedFormat(item.avg_speed) }} / {{ speedFormat(item.max_speed) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Max Wind Speed</dt>
                <dd class="flex xs12 md6 pa-2">{{ speedFormat(item.max_wind_speed) }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">Note</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input v-model="formData.notes" outline type="textarea" placeholder="Note" />
                </dd>
              </dl>
              <template v-if="updateError">
                <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</va-alert>
              </template>
              <div class="row justify--end">
                <div class="flex">
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
  import PostgSail from '../../services/postgsail.js'
  import { dateFormat } from '../../utils/dateFormater.js'
  import { distanceFormat } from '../../utils/distanceFormater.js'
  import { speedFormat } from '../../utils/speedFormater.js'
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
    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.log_get(id)
      if (response.data) {
        apiData.row = response.data
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      apiError.value = response.data.message
      console.warn('Get data from json...', apiError.value)
      const row = logsBooks.find((row) => row.id == route.params.id)
      apiData.row = row
    } finally {
      formData.name = apiData.row.Name || null
      formData.notes = apiData.row.Notes || null
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
      if (response.data) {
        console.log('log_update success', response.data)
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
