<template>
  <div class="leaflet-maps leaflet-map__full">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-inner-loading :loading="item && isBusy">
      <template v-if="item && item.geoJson">
        <va-card>
          <l-map
            id="logbook-map"
            ref="logMap"
            :geo-json-features="GeoJSONfeatures"
            :tabs="['summary', 'performance', 'observations', 'export']"
            :tabs-auto-open="true"
            :control-layer="true"
            :map-zoom="17"
            :external-link="externalLink"
            :show-note="true"
            @save-note="saveNote"
            @delete-point="deletePoint"
          >
            <template #tab-summary><va-icon name="summarize" /></template>
            <template #content-summary>
              <template v-if="item">
                <trip-summary
                  v-if="item"
                  :logbook="item"
                  :form-data="formData"
                  :loading="isBusy"
                  :tags="tagsOptions"
                  @delete="handleDelete"
                  @save="handleSubmit"
                  @newtag="addTag"
                  @rmtag="deleteTag"
                  @updatetag="updateTags"
                />
              </template>
            </template>
            <template #tab-performance><va-icon name="bar_chart" /></template>
            <template #content-performance>
              <template v-if="item">
                <trip-performance
                  v-if="item"
                  :winddata="wind_arr"
                  :twddata="twd_arr"
                  :speeddata="speed_arr"
                  :labels="labels_arr"
                  :polardata="item.polar"
                  :loading="isBusy"
                />
              </template>
            </template>
            <template #tab-observations><va-icon name="settings_suggest" /></template>
            <template #content-observations>
              <template v-if="item">
                <trip-observations
                  v-if="item"
                  :logbook="item"
                  :form-data="formData"
                  :loading="isBusy"
                  @updated="handlePhotoUpdated"
                />
              </template>
            </template>
            <template #tab-export><va-icon name="ios_share" /></template>
            <template #content-export>
              <template v-if="item">
                <trip-export v-if="item" :logbook="item" :form-data="formData" :loading="isBusy" />
              </template>
            </template>
          </l-map>
        </va-card>
      </template>
    </va-inner-loading>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { setAppTitle } from '../../utils/app.js'
  import PostgSail from '../../services/api-client'
  import { useCacheStore } from '../../stores/cache-store'
  import { dateFormatUTC, durationFormatHours, durationI18nHours } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { useModal, useToast } from 'vuestic-ui'
  const { confirm } = useModal()
  const { init: initToast } = useToast()
  import logBook from '../../data/logbook.json'
  import { useGlobalStore } from '../../stores/global-store'
  import { useVesselStore } from '../../stores/vessel-store'
  import { default as utils } from '../../utils/utils.js'

  const { t } = useI18n()

  const { readOnly } = useGlobalStore()

  import lMap from '../../components/maps/leafletMap.vue'
  import tripSummary from './sidebars/Summary.vue'
  import tripPerformance from './sidebars/Performance.vue'
  import tripObservations from './sidebars/Observations.vue'
  import tripExport from './sidebars/Export.vue'
  import moment from 'moment'
  import { storeToRefs } from 'pinia'

  const CacheStore = useCacheStore()
  const GlobalStore = useGlobalStore()
  const { isSidebarMinimized } = storeToRefs(GlobalStore)
  const router = useRouter()
  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const updateError = ref(null)
  const apiData = reactive({ row: null })
  const formData = reactive({
    isValid: true,
    name: null,
    notes: null,
    geojson: null,
    tags: [],
  })
  const logMap = ref(null),
    speed_arr = ref([]),
    wind_arr = ref([]),
    twd_arr = ref([]),
    labels_arr = ref([]),
    GeoJSONfeatures = ref(),
    tagsOptions = ref([])

  const item = computed(() => {
    const extractEngineRunTimes = (metrics) => {
      const engineRunTimes = []
      for (const key in metrics) {
        if (key.startsWith('propulsion.')) {
          const parts = key.split('.')
          if (parts.length === 3 && parts[2] === 'runTime') {
            const engineName = parts[1]
            const duration = durationFormatHours(metrics[key]) + ' ' + durationI18nHours(metrics[key])
            engineRunTimes.push({ name: engineName, duration })
          }
        }
      }
      return engineRunTimes
    }
    return apiData.row
      ? {
          id: apiData.row.id,
          name: apiData.row.name,
          from: apiData.row.from,
          to: apiData.row.to,
          fromTime: dateFormatUTC(apiData.row.started),
          toTime: dateFormatUTC(apiData.row.ended),
          distance: distanceFormatMiles(apiData.row.distance),
          duration: durationFormatHours(apiData.row.duration) + ' ' + durationI18nHours(apiData.row.duration),
          notes: apiData.row.notes,
          geoJson: apiData.row.geojson,
          avg_speed: speedFormatKnots(apiData.row.avg_speed),
          max_speed: speedFormatKnots(apiData.row.max_speed),
          max_wind_speed: speedFormatKnots(apiData.row.max_wind_speed),
          avg_wind_speed: speedFormatKnots(apiData.row?.extra?.avg_wind_speed || 0),
          extra: apiData.row?.extra || {},
          engineHours: extractEngineRunTimes(apiData.row?.extra?.metrics),
          seaState: apiData.row?.observations?.seaState || -1,
          cloudCoverage: apiData.row?.observations?.cloudCoverage || -1,
          visibility: apiData.row?.observations?.visibility || -1,
          tags: apiData.row?.tags || [],
          from_moorage_id: apiData.row.from_moorage_id,
          to_moorage_id: apiData.row.to_moorage_id,
          images: apiData.row.has_images ? apiData.row?.images || [] : [],
          image_updated_at: apiData.row.image_updated_at ? dateFormatUTC(apiData.row.image_updated_at) : null,
          polar: apiData.row.polar || null,
          // Extract segment data from GeoJSON
          segments:
            apiData.row.geojson?.features
              ?.filter(
                (feature) => feature.geometry?.type === 'LineString' && feature.properties?.segment_num !== undefined,
              )
              .map((feature) => ({
                segment_num: feature.properties.segment_num,
                distance: distanceFormatMiles(feature.properties.distance),
                duration:
                  durationFormatHours(feature.properties.duration) +
                  ' ' +
                  durationI18nHours(feature.properties.duration),
              }))
              .sort((a, b) => a.segment_num - b.segment_num) || [],
        }
      : {}
  })
  const externalLink = computed(() => {
    return '/maplapse/' + item.value.id + '?height=100vh'
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
    const id = route.params.id
    try {
      const response = await CacheStore.getAPI('log_get', id)
      apiData.row = response[0]
      formData.name = apiData.row.name || null
      formData.notes = apiData.row.notes || null
      formData.geojson = apiData.row.geojson || null
      formData.tags = apiData.row?.tags || []
      tagsOptions.value = CacheStore.logsTags
      if (formData.name) {
        document.title = setAppTitle(t('logs.details.title') + ': ' + formData.name)
      }
      let geo_arr = apiData.row.geojson?.features || []
      for (var i = 1; i < geo_arr.length; i++) {
        //console.log(geo_arr[i].properties)
        wind_arr.value.push(geo_arr[i].properties.truewindspeed)
        twd_arr.value.push(geo_arr[i].properties.truewinddirection)
        speed_arr.value.push(geo_arr[i].properties.speedoverground)
        labels_arr.value.push(geo_arr[i].properties.time)
      }
      // Minimize sidebar for map view
      isSidebarMinimized.value = true
      // Set GeoJSON features for map
      GeoJSONfeatures.value = mapGeoJsonFeatures.value
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

  const confirmDeleteTrackpoint = async () => {
    console.log('confirmDeleteTrackpoint')
    document.getElementById('logbook-map').style.display = 'none'
    isBusy.value = true
    updateError.value = null
    let canDelete = false

    const modal_result = await confirm({
      message: 'This will permanently delete the Trackpoint! Do you really want to continue?',
      title: 'Are you sure?',
      okText: 'Yes, I agree',
      cancelText: 'No, keep my data',
      //zIndex: -9999,
    })
    if (modal_result) {
      canDelete = true
      if (readOnly) {
        initToast({
          message: `Demo account readonly`,
          position: 'top-right',
          color: 'warning',
        })
        return false
      }
    } else {
      isBusy.value = false
      document.getElementById('logbook-map').style.display = ''
      initToast('Operation cancel')
    }

    return canDelete
  }

  // Add a note to GeoJSON feature point - Mobilitydb
  const saveNote = async function (timestamp, note) {
    //console.log('saveNote to update:', timestamp, note)
    // '["notes"@2024-11-07T18:40:45+00, ""@2024-11-07T18:41:45+00]'
    const plusone = moment.utc(timestamp).add(1, 'minutes').format()
    // to be clean we need the next timestamp
    const update_string = `["${note}"@${timestamp}, ""@${plusone}]`
    console.log('saveNote update_string:', update_string)

    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.log_update_trip_notes({ _id: parseInt(id), update_string: update_string })
      if (response) {
        console.log('log_update_trip_notes success', response)
        // Clean CacheStore and force refresh
        CacheStore.logs = []
        CacheStore.logs_get = []
        CacheStore.store_ttl = null
        await CacheStore.resetCache()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_update_trip_notes failed', response)
      updateError.value = response.message
    } finally {
      initToast({
        message: updateError.value ? `Error updating log note entry` : `Successfully updating log note entry`,
        position: 'top-right',
        color: updateError.value ? 'warning' : 'success',
      })
      isBusy.value = false
      router.push({ name: 'logs' })
    }
  }

  // Delete point from GeoJSON feature point - Mobilitydb
  const deletePoint = async function (timestamp) {
    //console.log('deletePoint to delete:', timestamp)
    const toDelete = await confirmDeleteTrackpoint()
    // '[2024-11-07T18:40:45+00:00, 2024-11-07T18:41:45+00:00]'
    const plusone = moment.utc(timestamp).add(1, 'minutes').format()
    // to be clean we need the next timestamp
    const update_string = `[${timestamp}, ${plusone}]`
    console.log('deletePoint update_string:', update_string)
    if (toDelete) {
      const api = new PostgSail()
      const id = route.params.id
      try {
        const response = await api.log_delete_trip_entry_fn({ _id: parseInt(id), update_string: update_string })
        if (response) {
          console.log('log_delete_trip_entry_fn success', response)
          // Clean CacheStore and force refresh
          CacheStore.logs = []
          CacheStore.logs_get = []
          CacheStore.store_ttl = null
          await CacheStore.resetCache()
        } else {
          throw { response }
        }
      } catch (err) {
        const { response } = err
        console.log('log_delete_trip_entry_fn failed', response)
        updateError.value = response.message
      } finally {
        initToast({
          message: updateError.value ? `Error deleting log note entry` : `Successfully deleting log note entry`,
          position: 'top-right',
          color: updateError.value ? 'warning' : 'success',
        })
        isBusy.value = false
        router.push({ name: 'logs' })
      }
    }
    document.getElementById('logbook-map').style.display = ''
    console.log('deletePoint done')
  }

  const handleSubmit = async () => {
    isBusy.value = true
    updateError.value = null

    if (readOnly) {
      initToast({
        message: `Demo account readonly`,
        position: 'top-right',
        color: 'warning',
      })
      isBusy.value = false
      return true
    }
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
        logMap.value.refreshLayers()
        await CacheStore.resetCache()
        CacheStore.refresh = 'true'
        CacheStore.getAPI('log_get', id)
        CacheStore.refresh = 'false'
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

  const handleDelete = async (log) => {
    console.log('handleDelete', log)
    document.getElementById('logbook-map').style.display = 'none'
    isBusy.value = true
    updateError.value = null
    let canDelete = false

    const modal_result = await confirm({
      message: `This will permanently delete the Log Entry and any associated Stays. Do you really want to continue? Trip: ${log.name}`,
      title: 'Are you sure?',
      okText: 'Yes, I agree',
      cancelText: 'No, keep my data',
      //zIndex: -9999,
    })
    if (modal_result) {
      canDelete = true
    } else {
      isBusy.value = false
      document.getElementById('logbook-map').style.display = ''
      initToast('Operation cancel')
    }

    if (!canDelete) return

    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.log_delete(id)
      if (response) {
        console.log('log_delete success', response)
        // Clean CacheStore and force refresh
        CacheStore.logs = []
        CacheStore.logs_get = []
        CacheStore.store_ttl = null
        await CacheStore.resetCache()
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('log_delete failed', response)
      updateError.value = response.message
    } finally {
      initToast({
        message: updateError.value ? `Error deleting log entry` : `Successfully deleting log entry`,
        position: 'top-right',
        color: updateError.value ? 'warning' : 'success',
      })
      isBusy.value = false
      router.push({ name: 'logs' })
    }
  }

  const addTag = function (newTag) {
    console.log('addTag', newTag)
    tagsOptions.value = [...tagsOptions.value, newTag]
    formData.tags = [...formData.tags, newTag]
    updateAPITags(formData.tags)
  }
  const deleteTag = function (chip) {
    console.log('deleteTag', chip)
    formData.tags = formData.tags.filter(function (tag) {
      return tag !== chip
    })
    updateAPITags(formData.tags)
  }
  const updateTags = function (newTags) {
    console.log('updateTags', newTags)
    formData.tags = newTags
    tagsOptions.value = newTags
    updateAPITags(newTags)
  }
  function updateAPITags(tags) {
    // runBusy handles isBusy & apiError
    console.log('updateAPITags', tags)
    const id = route.params.id
    new PostgSail()
      .update_observations({ _id: id, observations: { tags: tags } })
      .then(async (response) => {
        console.log('updateAPITags success', response)
        // Clean CacheStore and force refresh
        await CacheStore.resetCache()
        CacheStore.refresh = 'true'
        await CacheStore.getAPI('log_get', id)
        CacheStore.refresh = 'false'
        return true
      })
      .catch((err) => {
        console.log('updateAPITags failed', err.message ?? err)
        updateError.value = err.message ?? err
      })
      .finally(() => {
        initToast({
          message: updateError.value ? `Error updating log tag entry` : `Successfully updating log tag entry`,
          position: 'top-right',
          color: updateError.value ? 'warning' : 'success',
        })
        isBusy.value = false
      })
  }

  const handlePhotoUpdated = async (updatedPhoto) => {
    console.log('handlePhotoUpdated', updatedPhoto)
    apiData.row = {
      ...apiData.row,
      has_images: updatedPhoto.has_images,
      images: updatedPhoto.images,
    }
    // Clean CacheStore and force refresh
    await CacheStore.resetCache()
    await CacheStore.getAPI('log_get', apiData.row.id)
  }
</script>

<style lang="scss">
  #logbook-map {
    width: 100%;
    height: calc(100vh - 4.5rem);
  }
  .sidepanel {
    width: 320px;
    height: 100%;
    .sidepanel-content {
      width: 320px;
      height: 100%;
    }
  }
  .va-input-wrapper__field.va-input-wrapper__text.va-input__content__input {
    z-index: 9999 !important;
  }
  .va-dropdown__content.va-select-dropdown__content.va-dropdown__content-wrapper {
    z-index: 9999 !important;
  }
</style>
