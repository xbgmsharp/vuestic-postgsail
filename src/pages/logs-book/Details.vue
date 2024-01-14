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
            <lMap :geo-json-features="mapGeoJsonFeatures" :zoom="10" style="width: 100%; height: 350px" />
          </template>
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="formData.isValid = $event">
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.name') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <template v-if="isLoggedIn">
                    <VaValue v-slot="v">
                      <input
                        v-if="v.value"
                        v-model="formData.name"
                        outline
                        :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                        style="min-width: 100px; max-width: 50%"
                        class="inputbox"
                        @change="handleSubmit"
                      />
                      <span v-else>
                        {{ formData.name }}
                      </span>

                      <VaButton
                        :icon="v.value ? 'cancel' : 'edit'"
                        preset="plain"
                        size="small"
                        @click="v.value = !v.value"
                      />
                    </VaValue> </template
                  ><template v-else>
                    {{ item.name }}
                  </template>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.from') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link
                    v-if="typeof item.id !== 'undefined'"
                    class="va-text-bold va-link link"
                    :to="{ name: 'moorage-details', params: { id: item.from_moorage_id } }"
                  >
                    {{ item.from }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.from_time') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormatUTC(item.fromTime) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.to') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link
                    v-if="typeof item.id !== 'undefined'"
                    class="va-text-bold va-link link"
                    :to="{ name: 'moorage-details', params: { id: item.to_moorage_id } }"
                  >
                    {{ item.to }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.to_time') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormatUTC(item.toTime) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.duration') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  {{ durationFormatHours(item.duration) }} {{ durationI18nHours(item.duration) }}
                  /
                  {{ durationI18nDays(item.duration) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.distance') }}</dt>
                <dd class="xs12 md6 pa-2">
                  {{ distanceFormat(item.distance) }} (
                  <template v-if="isLoggedIn">
                    <router-link
                      v-if="typeof item.id !== 'undefined'"
                      class="va-text-bold va-link link"
                      :to="{ name: 'timelapse-replay', params: { id: item.id } }"
                    >
                      timelapse
                    </router-link> </template
                  ><template v-else>
                    <router-link
                      v-if="typeof item.id !== 'undefined'"
                      class="va-text-bold va-link link"
                      :to="{ name: 'timelapse-replay', params: { boat: publicVessel, id: item.id } }"
                    >
                      timelapse
                    </router-link>
                  </template>
                  )
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.avg_max_speed') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  {{ speedFormat(item.avg_speed) }} / {{ speedFormat(item.max_speed) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.max_wind_speed') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ speedFormat(item.max_wind_speed) }}</dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.note') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <template v-if="isLoggedIn">
                    <VaTextarea
                      v-model="formData.notes"
                      outline
                      :placeholder="$t('logs.log.remarks')"
                      @change="handleSubmit"
                    /> </template
                  ><template v-else>
                    {{ item.notes }}
                  </template>
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
                  <template v-if="isLoggedIn">
                    <MySelect
                      v-if="item.seaState"
                      :id="parseInt(item.seaState)"
                      :key="item.seaState"
                      :data="parseInt(item.seaState)"
                      :object="seaState"
                      @clickFromChildComponent="handleSeaState"
                    />
                  </template>
                  <template v-else>
                    {{ item.seaState }}
                  </template>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.cloud_coverage') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <template v-if="isLoggedIn">
                    <va-slider
                      v-model="cloudCoverage"
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
                  </template>
                  <template v-else>
                    {{ cloudCoverage }}
                  </template>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.visibility') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <template v-if="isLoggedIn">
                    <MySelect
                      v-if="item.visibility"
                      :id="parseInt(item.visibility)"
                      :key="item.visibility"
                      :data="parseInt(item.visibility)"
                      :object="visibility"
                      @clickFromChildComponent="handleVisibility"
                    />
                  </template>
                  <template v-else>
                    {{ item.visibility }}
                  </template>
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
                  <va-icon name="kml" :size="44" @click="handleKML(item.id)" />
                </dd>
              </dl>
              <!-- sharing section -->
              <!-- EMail, Facebook, more? -->
              <va-divider orientation="center" class="divider">
                <span class="px-2">{{ $t('logs.log.share') }}</span>
              </va-divider>
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('logs.log.share') }}</dt>
                <dd class="export-buttons xs12 md6 pa-1">
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fiot.openplotter.cloud%2F${publicVessel}%2Flog%2F${item.id}`"
                    target="_blank"
                    ><va-icon name="facebook" :size="44"
                  /></a>
                  <template v-if="instagram">
                    <a :href="`https://www.instagram.com/${instagram}/`" target="_blank">
                      <va-icon name="instagram" :size="44"
                    /></a>
                  </template>
                  <a
                    :href="`https://twitter.com/intent/tweet?text=From ${formData.name}&url=https%3A%2F%2Fiot.openplotter.cloud/${publicVessel}/log/${item.id}`"
                    target="_blank"
                  >
                    <va-icon name="x-twitter" :size="44"
                  /></a>
                  <a
                    :href="
                      `mailto:?subject=${publicVessel}'s Trip From ${formData.name}&body=Marine logbook entry for the ` +
                      String(distanceFormat(item.distance)) +
                      ` trip from ${item.from} to ${item.to}, lasting ` +
                      String(durationFormatHours(item.duration)) +
                      `hours.%0D%0A%0D%0Ahttps://iot.openplotter.cloud/${publicVessel}/log/${item.id}`
                    "
                    target="_blank"
                    ><va-icon name="envelope" :size="44"
                  /></a>
                  <template v-if="website">
                    <a :href="website" target="_blank"><va-icon name="envelope" :size="44" /></a>
                  </template>
                </dd>
              </dl>
              <br />
              <template v-if="updateError">
                <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</va-alert>
              </template>
              <template v-if="isLoggedIn">
                <!--
                <div class="flex flex-row pa-2">
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
                </div>
              -->
                <div class="flex flex-row pa-2">
                  <va-button color="danger" @click="handleDelete">Delete</va-button>
                </div>
              </template>
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
  import { dateFormatUTC, durationFormatHours, durationI18nHours, durationI18nDays } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { speedFormat } from '../../utils/speedFormatter.js'
  import lMap from '../../components/maps/leafletMap.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import { seaState, visibility } from '../../utils/PostgSail'
  import MySelect from '../../components/vaSelect.vue'
  import { useModal, useToast } from 'vuestic-ui'
  const { confirm } = useModal()
  const { init: initToast } = useToast()
  import logBook from '../../data/logbook.json'
  import { useGlobalStore } from '../../stores/global-store'
  const { isLoggedIn, publicVessel, instagram, website } = useGlobalStore()

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
          name: apiData.row.name,
          from: apiData.row.from,
          fromTime: apiData.row.started,
          to: apiData.row.to,
          toTime: apiData.row.ended,
          distance: apiData.row.distance,
          duration: apiData.row.duration,
          notes: apiData.row.notes,
          geoJson: apiData.row.geojson,
          avg_speed: apiData.row.avg_speed,
          max_speed: apiData.row.max_speed,
          max_wind_speed: apiData.row.max_wind_speed,
          extra: apiData.row?.extra?.metrics,
          seaState: apiData.row?.extra?.observations?.seaState || -1,
          cloudCoverage: apiData.row?.extra?.observations?.cloudCoverage || -1,
          visibility: apiData.row?.extra?.observations?.visibility || -1,
          from_moorage_id: apiData.row.from_moorage_id,
          to_moorage_id: apiData.row.to_moorage_id,
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
      formData.name = apiData.row.name || null
      formData.notes = apiData.row.notes || null
      cloudCoverage.value = apiData.row?.extra?.observations?.cloudCoverage || -1
      document.title = `${publicVessel}'s Trip From ${apiData.row.name}`
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD && import.meta.env.VITE_APP_INCLUDE_DEMOS) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        const row = logBook.find((row) => row.id == route.params.id)
        apiData.row = row
      }
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
        return true
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_update failed', response)
      updateError.value = response.message
    } finally {
      initToast({
        message: updateError.value ? `Error updating log entry` : `Successfully updated log entry`,
        position: 'top-right',
        color: updateError.value ? 'warning' : 'success',
      })
      isBusy.value = false
    }
  }

  const handleDelete = async () => {
    isBusy.value = true
    updateError.value = null
    let canDelete = false

    const modal_result = await confirm({
      message: 'This will permanently delete the Log Entry and any associated Stays. Do you really want to continue?',
      title: 'Are you sure?',
      okText: 'Yes, I agree',
      cancelText: 'No, keep my data',
    })
    if (modal_result) {
      canDelete = true
    } else {
      isBusy.value = false
      initToast('Operation cancel')
    }

    if (!canDelete) return

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
    handleKML = (id) => handleExport_common('kml', id),
    handleGeoJSON = (id) => handleExport_common('geojson', id),
    handleExport_common = (format, id) => runBusy(handleExport, format, 'log', { _id: id }, `log_${id}`)

  // handle Observations
  const handleSeaState = async (new_sea_state, obj) => {
    console.log('handleSeaState new_sea_state', new_sea_state, obj)
    if (new_sea_state >= 0) {
      console.log('handleSeaState obj:', obj.value + ', text:' + obj.text)
      updateObservations({ seaState: new_sea_state })
    }
  }
  const handleVisibility = async (new_visibility, obj) => {
    console.log('handleVisibility', new_visibility, obj)
    if (new_visibility >= 0) {
      console.log('handleVisibility:', obj.value + ', text:' + obj.text)
      updateObservations({ visibility: new_visibility })
    }
  }

  const cloudCoverage = ref(-1)
  const sliderLabel = computed(() => `${cloudCoverage.value}/8`)
  const handleCloudCoverage = (new_cloudCoverage) => {
    console.log('handleCloudCoverage : ', new_cloudCoverage)
    updateObservations({ cloudCoverage: new_cloudCoverage })
    cloudCoverage.value = new_cloudCoverage
  }
  function updateObservations(new_obs) {
    // runBusy handles isBusy & apiError
    console.log('updateObservations', new_obs)
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
  .divider {
    margin-top: 2em;
    margin-bottom: 1em;
  }
  .slider-template {
    width: 20px !important;
  }
  .inputbox {
    background: white;
    border: 1px solid #ccc;
  }
</style>
