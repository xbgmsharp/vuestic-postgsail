<template>
  <div class="leaflet-maps leaflet-map__full">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-inner-loading :loading="item && isBusy">
      <template v-if="item && item.geoJson">
        <va-card>
          <lMap
            id="logbook-map"
            :tabs="['summary', 'performance', 'observations', 'export']"
            :geo-json-features="mapGeoJsonFeatures"
            :control-layer="true"
            :map-zoom="17"
            :external-link="externalLink"
            :show-note="true"
            :save-note="saveNote"
            :delete-point="deletePoint"
          >
            <template #tab-summary><va-icon name="summarize" /></template>
            <template #content-summary>
              <template v-if="item">
                <tripSummary
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
                <tripPerformance
                  v-if="item"
                  :winddata="wind_arr"
                  :speeddata="speed_arr"
                  :labels="labels_arr"
                  :loading="isBusy"
                />
              </template>
            </template>
            <template #tab-observations><va-icon name="settings_suggest" /></template>
            <template #content-observations>
              <template v-if="item">
                <tripObservations v-if="item" :logbook="item" :form-data="formData" :loading="isBusy" />
              </template>
            </template>
            <template #tab-export><va-icon name="ios_share" /></template>
            <template #content-export>
              <template v-if="item">
                <tripExport v-if="item" :logbook="item" :form-data="formData" :loading="isBusy" />
              </template>
            </template>
          </lMap>
        </va-card>
      </template>
    </va-inner-loading>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { setAppTitle } from '../../utils/app.js'
  import PostgSail from '../../services/api-client'
  import { useCacheStore } from '../../stores/cache-store'
  import { dateFormatUTC, durationFormatHours, durationI18nHours, dateFormatTime } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { useModal, useToast } from 'vuestic-ui'
  const { confirm } = useModal()
  const { init: initToast } = useToast()
  import logBook from '../../data/logbook.json'
  import { useGlobalStore } from '../../stores/global-store'
  import { useVesselStore } from '../../stores/vessel-store'

  const { t } = useI18n()

  const { readOnly } = useGlobalStore()

  import lMap from '../../components/maps/leafletMap.vue'
  import tripSummary from './sidebars/Summary.vue'
  import tripPerformance from './sidebars/Performance.vue'
  import tripObservations from './sidebars/Observations.vue'
  import tripExport from './sidebars/Export.vue'

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
    geojson: null,
    tags: [],
  })
  const speed_arr = ref([]),
    wind_arr = ref([]),
    labels_arr = ref([]),
    GeoJSONfeatures = ref(),
    GeoJSONbasemapObj = ref({}),
    tagsOptions = ref([])

  const item = computed(() => {
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
          extra: apiData.row?.extra?.metrics,
          seaState: apiData.row?.extra?.observations?.seaState || -1,
          cloudCoverage: apiData.row?.extra?.observations?.cloudCoverage || -1,
          visibility: apiData.row?.extra?.observations?.visibility || -1,
          tags: apiData.row?.extra?.tags || [],
          from_moorage_id: apiData.row.from_moorage_id,
          to_moorage_id: apiData.row.to_moorage_id,
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
    console.log('onMounted')
    isBusy.value = true
    apiError.value = null
    const id = route.params.id
    try {
      const response = await CacheStore.getAPI('log_get', id)
      apiData.row = response[0]
      console.log('onMounted', apiData.row)
      formData.name = apiData.row.name || null
      formData.notes = apiData.row.notes || null
      formData.geojson = apiData.row.geojson || null
      formData.tags = apiData.row?.extra?.tags || []
      tagsOptions.value = CacheStore.getTags()
      if (formData.name) {
        document.title = setAppTitle(t('logs.details.title') + ': ' + formData.name)
      }
      let geo_arr = apiData.row.geojson.features
      for (var i = 1; i < geo_arr.length; i++) {
        //console.log(geo_arr[i].properties)
        wind_arr.value.push(geo_arr[i].properties.truewindspeed)
        speed_arr.value.push(geo_arr[i].properties.speedoverground)
        labels_arr.value.push(dateFormatTime(geo_arr[i].properties.time))
      }
      GeoJSONfeatures.value = mapGeoJsonFeatures.value
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD && import.meta.env.VITE_APP_INCLUDE_DEMOS) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        const row = logBook.find((row) => row.id == route.params.id)
        apiData.row = row
      }
    } finally {
      console.log('onMounted finally')
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
      zIndex: -9999,
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

  const saveNote = async function (coordinates) {
    console.log('saveNote to update:', coordinates)
    var note = document.getElementById('noteTextarea').value
    //layer.closePopup()

    // Save the note to the GeoJSON
    for (let i = 0; i < GeoJSONfeatures.value.length; i++) {
      const geofeature = GeoJSONfeatures.value[i]
      // Check if the feature is a point
      if (geofeature.geometry.type === 'Point') {
        // Get the coordinates of the point
        const pointCoordinates = geofeature.geometry.coordinates
        // Check if the coordinates match the target coordinates
        if (pointCoordinates[0] === coordinates[0] && pointCoordinates[1] === coordinates[1]) {
          console.log('GeoJSONfeatures index:', i)
          GeoJSONfeatures.value[i].properties.notes = note
          break // Exit loop if the point is found
        }
      }
    }

    // Update each GeoJSON layer on the map
    Object.keys(GeoJSONbasemapObj.value).forEach((GeoJSONlayer) => {
      GeoJSONbasemapObj.value[GeoJSONlayer].clearLayers()
      GeoJSONbasemapObj.value[GeoJSONlayer].addData(GeoJSONfeatures.value)
      //console.log(GeoJSONfeatures.value.length)
      //console.log(GeoJSONfeatures.value)
    })

    const track_geojson = {
      type: 'FeatureCollection',
      features: GeoJSONfeatures.value,
    }
    // Save change the new GeoJSON to the DB
    const isSaved = await handleSubmit(track_geojson)
    if (isSaved) {
      console.log('saveNote saved')
    }
  }

  // Delete point from GeoJSON features
  const deletePoint = async function (coordinates) {
    console.log('deletePoint to delete:', coordinates)
    const toDelete = await confirmDeleteTrackpoint()
    if (toDelete) {
      console.log('deletePoint confirmed continue')
      GeoJSONfeatures.value = GeoJSONfeatures.value.filter(function (geofeature) {
        if (geofeature.geometry.type === 'Point') {
          return JSON.stringify(geofeature.geometry.coordinates) !== JSON.stringify(coordinates)
        } else if (geofeature.geometry.type === 'LineString') {
          geofeature.geometry.coordinates = geofeature.geometry.coordinates.filter(function (lineStringCoords) {
            return JSON.stringify(lineStringCoords) !== JSON.stringify(coordinates)
          })
          return geofeature.geometry.coordinates.length > 0
        }
        return true
      })

      // Update each GeoJSON layer on the map
      Object.keys(GeoJSONbasemapObj.value).forEach((GeoJSONlayer) => {
        GeoJSONbasemapObj.value[GeoJSONlayer].clearLayers()
        GeoJSONbasemapObj.value[GeoJSONlayer].addData(GeoJSONfeatures.value)
        //console.log(GeoJSONfeatures.value.length)
        //console.log(GeoJSONfeatures.value)
      })

      const track_geojson = {
        type: 'FeatureCollection',
        features: GeoJSONfeatures.value,
      }
      // Save change the new GeoJSON to the DB
      const isSaved = await handleSubmit(track_geojson)
      if (isSaved) {
        console.log('deletePoint removed')
      }
    }
    isBusy.value = false
    document.getElementById('logbook-map').style.display = ''
    console.log('deletePoint done')
  }

  const handleSubmit = async (local_geojson) => {
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
    /* From the emit we received a logbook trip entry
      From the leaflet map we received a valid geojson */
    //console.debug(local_geojson.geoJson.features[0].properties)
    let geojson = {}
    if (local_geojson.name) {
      // If we have a log entry object, then update the geojson name in linestring geometry
      local_geojson.geoJson.features[0].properties.name = formData.name
      geojson = local_geojson.geoJson
      // Update the corresponding geojson display on the map.
      mapGeoJsonFeatures.value[0].properties.name = formData.name
      mapGeoJsonFeatures.value[0].properties.notes = formData.notes
      // Update the corresponding leaflet layer popup on lineString click
      Object.keys(GeoJSONbasemapObj.value).forEach((GeoJSONlayer) => {
        //GeoJSONbasemapObj.value.forEach(function (GeoJSONlayer) {
        GeoJSONbasemapObj.value[GeoJSONlayer].eachLayer(function (layer) {
          if (layer.LineString) {
            //console.log(layer)
            layer._popup.setContent(`<div class='center'><h4>${formData.name}</h4></div><br/>
                Time: ${item.value.fromTime}<br/>
                Average Speed: ${item.value.avg_speed}<br/>
                Duration: ${item.value.duration}<br/>
                Distance: ${item.value.distance}<br/>
                Notes: ${formData.notes}<br/>`)
          }
        })
      })
    } else {
      geojson = local_geojson
    }
    console.debug(local_geojson)
    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      name: formData.name,
      notes: formData.notes,
      track_geojson: geojson,
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
      zIndex: -9999,
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
      .then((response) => {
        console.log('updateAPITags success', response)
        // Clean CacheStore and force refresh
        CacheStore.resetCache()
        CacheStore.refresh = 'true'
        CacheStore.getAPI('log_get', id)
        CacheStore.refresh = 'false'
        return true
      })
      .catch((err) => {
        console.log('updateAPITags failed', err.message ?? err)
        //throw err.message ?? err
      })
  }
</script>

<style lang="scss">
  #logbook-map {
    width: 100%;
    height: calc(100vh - 4.5rem);
  }
  .sidepanel {
    width: 350px;
    .sidepanel-content {
      width: 350px;
    }
  }
  .va-input-wrapper__field.va-input-wrapper__text.va-input__content__input {
    z-index: 9999 !important;
  }
  .va-dropdown__content.va-select-dropdown__content.va-dropdown__content-wrapper {
    z-index: 9999 !important;
  }
</style>
