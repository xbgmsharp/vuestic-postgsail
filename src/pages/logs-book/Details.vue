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
            <lMap :geo-json-features="mapGeoJsonFeatures" :zoom="8" style="width: 100%; height: 350px" />
          </template>
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="formData.isValid = $event">
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.name') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-input
                    v-model="formData.name"
                    placeholder="Name"
                    outline
                    :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                    style="min-width: 100px; max-width: 40%"
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
                <dd class="flex xs12 md6 pa-2">
                  {{ durationFormatHours(item.duration) }} {{ durationI18nHours(item.duration) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.distance') }}</dt>
                <dd class="xs12 md6 pa-2">
                  {{ distanceFormat(item.distance) }} (<router-link
                    v-if="typeof item.id !== 'undefined'"
                    class="va-text-bold va-link link"
                    :to="{ name: 'timelapse', params: { id: item.id } }"
                  >
                    timelapse </router-link
                  >)
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.avg_max_speed') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  {{ speedFormat(item.avg_speed) }} / {{ speedFormat(item.max_speed) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.max_wind_speed') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ speedFormat(item.max_wind_speed) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.note') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input v-model="formData.notes" outline type="textarea" :placeholder="$t('logs.log.remarks')" />
                </dd>
              </dl>
              <!-- metadata section -->
              <template v-if="item.extra && Object.keys(item.extra).length > 0">
                <va-divider orientation="center" class="divider">
                  <span class="flex xs12">{{ $t('logs.log.metadata') }}</span>
                </va-divider>
                <dl v-for="(value, index) in Object.entries(item.extra)" :key="index" class="dl-details row mb-3">
                  <dt class="flex xs12 md6 pa-2 va-text-bold">{{ value[0] }}</dt>
                  <dd class="flex xs12 md6 pa-2">{{ value[1] }}</dd>
                </dl>
              </template>
              <!-- observations section -->
              <va-divider orientation="center" class="divider">
                <span class="flex xs12">{{ $t('logs.log.observations') }}</span>
              </va-divider>
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.sea_state') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-select
                    v-model="seaState[item.seaState]"
                    :options="seaState"
                    outline
                    style="min-width: 100px; max-width: 40%"
                    @update:modelValue="runBusy(handleSeaState, seaState[item.seaState], $event)"
                  />
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.cloud_coverage') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-slider
                    v-if="item.cloudCoverage"
                    v-model="item.cloudCoverage"
                    stateful
                    track-label-visible
                    invert-label
                    :min="-1"
                    :max="8"
                    :step="1"
                    style="min-width: 100px; max-width: 40%"
                    :label="sliderLabel"
                    @update:modelValue="runBusy(handleCloudCoverage, $event)"
                  >
                  </va-slider>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.visibility') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-select
                    v-model="visibility[item.visibility]"
                    :options="visibility"
                    outline
                    style="min-width: 100px; max-width: 40%"
                    @update:modelValue="runBusy(handleVisibility, visibility[item.visibility], $event)"
                  />
                </dd>
              </dl>
              <!-- export section -->
              <va-divider orientation="center" class="divider">
                <span class="px-2">{{ $t('logs.log.export') }}</span>
              </va-divider>
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.export') }}</dt>
                <dd class="export-buttons xs12 md6 pa-1">
                  <va-icon name="gpx" :size="44" @click="handleGPX(item.id)" />
                  <va-icon name="geojson" :size="44" @click="handleGeoJSON(item.id)" />
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
  import { dateFormat, durationFormatHours, durationI18nHours } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { speedFormat } from '../../utils/speedFormatter.js'
  import lMap from '../../components/maps/leafletMap.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import { seaState, visibility } from '../../utils/PostgSail'

  import logsBooks from '../../data/logbook.json'

  const CacheStore = useCacheStore()
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
          extra: apiData.row?.extra?.metrics,
          seaState: apiData.row?.extra?.observations?.seaState || -1,
          cloudCoverage: apiData.row?.extra?.observations?.cloudCoverage || -1,
          visibility: apiData.row?.extra?.observations?.visibility || -1,
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
      if (response) {
        console.log('log_update success', response)
        // Clean CacheStore and force refresh
        CacheStore.logs = []
        CacheStore.logs_get = []
        CacheStore.store_ttl = null
        CacheStore.getAPI('logs')
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_update failed', response)
      updateError.value = response.message
    } finally {
      isBusy.value = false
    }
  }

  const handleDelete = async () => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.log_delete(id)
      if (response) {
        console.log('log_delete success', response)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_delete failed', response)
      updateError.value = response.message
    } finally {
      isBusy.value = false
    }
  }

  /*
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
      if (response) {
        console.log('log_export_gpx success', response.gpx)
        const blob = new Blob([response.gpx], { type: 'text/xml' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `log_export_gpx_${id}.gpx`
        link.click()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_export_gpx failed', response)
      updateError.value = response.message
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
      if (response) {
        console.log('log_export_geojson success', response)
        const geojson = JSON.stringify(response.geojson)
        const blob = new Blob([geojson], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `log_export_geojson_${id}.geojson`
        link.click()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_export_geojson failed', response)
      updateError.value = response.message
    } finally {
      isBusy.value = false
    }
  }*/

  // handle Exports
  const runBusy = (fn, ...args) => asBusy(isBusy, apiError, fn, ...args),
    handleGPX = (id) => handleExport_common('gpx', id),
    handleGeoJSON = (id) => handleExport_common('geojson2', id),
    handleExport_common = (format, id) => runBusy(handleExport, format, 'log', { _id: id }, `log_${id}`)

  // handle Observations
  function handleSeaState(new_sea_state) {
    if (new_sea_state) {
      console.log('sea_state-value:', new_sea_state.value + ', text:' + new_sea_state.text)
      updateObservations({ seaState: new_sea_state.value })
    }
  }
  const handleVisibility = (new_visibility) => {
    if (visibility) {
      console.log('visibility-value:', new_visibility.value + ', text:' + new_visibility.text)
      updateObservations({ visibility: new_visibility.value })
    }
  }

  const cloudCoverage = computed(() => {
    return item.value?.cloudCoverage || -1
  })
  const sliderLabel = computed(() => `${cloudCoverage.value}/8`)
  const handleCloudCoverage = (new_cloudCoverage) => {
    console.log('cloudCoverage : ', new_cloudCoverage)
    updateObservations({ cloudCoverage: new_cloudCoverage })
  }
  function updateObservations(new_obs) {
    // runBusy handles isBusy & apiError
    console.log(new_obs)
    const id = route.params.id
    new PostgSail()
      .update_observations({ _id: id, observations: { observations: new_obs } })
      .then((response) => {
        console.log('updateObservations success', response)
        // Clean CacheStore and force refresh
        CacheStore.logs = []
        CacheStore.logs_get = []
        CacheStore.store_ttl = null
        CacheStore.getAPI('logs')
      })
      .catch((err) => {
        console.log('updateObservations failed', err.message ?? err)
        //throw err.message ?? err
      })
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
    > .export-buttons {
      > .va-icon {
        display: inline-block;
      }
    }
  }
  .link {
    color: blue;
  }
  .link:hover {
    text-decoration: underline blue;
  }
  .divider {
    margin-top: 2em;
    margin-bottom: 1em;
  }
  .slider-template {
    width: 20px !important;
  }
</style>
