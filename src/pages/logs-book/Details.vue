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
              <!-- metadata -->
              <va-divider orientation="center" class="divider">
                <span class="flex xs12">{{ $t('logs.log.metadata') }}</span>
              </va-divider>
              <template v-if="item.extra">
                <dl v-for="(value, index) in Object.entries(item.extra)" :key="index" class="dl-details row mb-3">
                  <dt class="flex xs12 md6 pa-2 va-text-bold">{{ value[0] }}</dt>
                  <dd class="flex xs12 md6 pa-2">{{ value[1] }}</dd>
                </dl>
              </template>
              <!-- observations -->
              <va-divider orientation="center" class="divider">
                <span class="flex xs12">{{ $t('logs.log.observations') }}</span>
              </va-divider>
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.sea_state') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-select
                    v-model="seaState[item.seaState]"
                    :options="seaState"
                    :placeholder="text"
                    outline
                    style="min-width: 100px; max-width: 40%"
                  />
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.cloud_coverage') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-slider
                    v-mode="item.cloudCoverage"
                    track-label-visible
                    label="x/8"
                    invert-label
                    :min="-1"
                    :max="8"
                    :step="1"
                    style="min-width: 100px; max-width: 40%"
                  />
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.visibility') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-select
                    v-model="visibility[item.visibility]"
                    :options="visibility"
                    :placeholder="text"
                    outline
                    style="min-width: 100px; max-width: 40%"
                  />
                </dd>
              </dl>
              <!-- export -->
              <va-divider orientation="center" class="divider">
                <span class="px-2">{{ $t('logs.log.export') }}</span>
              </va-divider>
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.export') }}</dt>
                <dd class="export-buttons xs12 md6 pa-1">
                  <va-icon name="gpx" :size="44" @click="handleGPX(item.id)" />
                  <va-icon name="geojson" :size="44" @click="handleGeoJSON(mapGeoJsonFeatures)" />
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
          extra: apiData.row?.extra?.metrics,
          seaState: apiData.row?.extra?.observations?.seaState || -1,
          cloudCoverage: apiData?.row.extra?.observations?.cloudCoverage || -1,
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

  const runBusy = (fn, ...args) => asBusy(isBusy, apiError, fn, ...args),
    handleGPX = (id) => handleExport_common('gpx', id),
    handleGeoJSON = (id) => handleExport_common('geojson2', id),
    handleExport_common = (format, id) => runBusy(handleExport, format, 'log', { _id: id }, `log_${id}`)

  const seaState = ref([
    {
      value: -1,
      text: '',
    },
    {
      value: 0,
      text: 'Glassy calm (0m)',
    },
    {
      value: 1,
      text: 'Rippled calm (0-0.1m)',
    },
    {
      value: 2,
      text: 'Smooth (0.1-0.5m)',
    },
    {
      value: 3,
      text: 'Slight (0.5-1.25m)',
    },
    {
      value: 4,
      text: 'Moderate (1.25-2.5m)',
    },
    {
      value: 5,
      text: 'Rough (2.5-4m)',
    },
    {
      value: 6,
      text: 'Very rough (4-6m)',
    },
    {
      value: 7,
      text: 'High (6-9m)',
    },
    {
      value: 8,
      text: 'Very high (9-14m)',
    },
    {
      value: 9,
      text: 'Phenomenal (14m+)',
    },
  ])
  const visibility = ref([
    {
      value: -1,
      text: '',
    },
    {
      value: 0,
      text: 'Dense fog (<45m)',
    },
    {
      value: 1,
      text: 'Thick fog (<180m)',
    },
    {
      value: 2,
      text: 'Fog (<360m)',
    },
    {
      value: 3,
      text: 'Moderate fog (<0.5NM)',
    },
    {
      value: 4,
      text: 'Thin fog (<1NM)',
    },
    {
      value: 5,
      text: 'Poor visibility (<2NM)',
    },
    {
      value: 6,
      text: 'Moderate visibility (<5NM)',
    },
    {
      value: 7,
      text: 'Good visibility (<10NM)',
    },
    {
      value: 8,
      text: 'Very good visibility (<30NM)',
    },
    {
      value: 9,
      text: 'Excellent visibility (>30NM)',
    },
  ])
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
</style>
