<template>
  <div class="leaflet-maps">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-inner-loading :loading="item && isBusy">
      <va-card>
        <div id="sidepanel" class="sidepanel" aria-label="side panel" aria-hidden="false">
          <div class="sidepanel-inner-wrapper">
            <nav class="sidepanel-tabs-wrapper" aria-label="sidepanel tab navigation">
              <ul class="sidepanel-tabs">
                <li class="sidepanel-tab">
                  <a href="#summary" class="sidebar-tab-link" role="tab" data-tab-link="tab-1">
                    <VaIcon name="summarize" />
                  </a>
                </li>
                <li class="sidepanel-tab">
                  <a href="#performance" class="sidebar-tab-link" role="tab" data-tab-link="tab-2">
                    <VaIcon name="bar_chart" />
                  </a>
                </li>
                <li class="sidepanel-tab">
                  <a href="#observations" class="sidebar-tab-link" role="tab" data-tab-link="tab-3">
                    <VaIcon name="settings_suggest" />
                  </a>
                </li>
                <li class="sidepanel-tab">
                  <a href="#export" class="sidebar-tab-link" role="tab" data-tab-link="tab-4">
                    <VaIcon name="ios_share" />
                  </a>
                </li>
              </ul>
            </nav>
            <div class="sidepanel-content-wrapper">
              <div class="sidepanel-content">
                <div class="sidepanel-tab-content" data-tab-content="tab-1">
                  <template v-if="item">
                    <tripSummary
                      v-if="item"
                      :logbook="item"
                      :form-data="formData"
                      :loading="isBusy"
                      @delete="handleDelete"
                      @save="handleSubmit"
                    />
                  </template>
                </div>
                <div class="sidepanel-tab-content" data-tab-content="tab-2">
                  <template v-if="item">
                    <tripPerformance
                      v-if="item"
                      :winddata="wind_arr"
                      :speeddata="speed_arr"
                      :labels="labels_arr"
                      :loading="isBusy"
                    />
                  </template>
                </div>
                <div class="sidepanel-tab-content" data-tab-content="tab-3">
                  <template v-if="item">
                    <tripObservations v-if="item" :logbook="item" :form-data="formData" :loading="isBusy"
                  /></template>
                </div>
                <div class="sidepanel-tab-content" data-tab-content="tab-4">
                  <template v-if="item">
                    <tripExport v-if="item" :logbook="item" :form-data="formData" :loading="isBusy"
                  /></template>
                </div>
              </div>
            </div>
          </div>
          <div class="sidepanel-toggle-container">
            <button class="sidepanel-toggle-button" type="button" aria-label="toggle side panel"></button>
          </div>
        </div>
        <div id="mapContainer" ref="mapContainer" class="leaflet-map" />
      </va-card>
    </va-inner-loading>
  </div>
</template>

<script setup>
  import 'leaflet/dist/leaflet.css'
  import '../../components/maps/leaflet-sidepanel.css'
  import * as L from 'leaflet'
  import 'leaflet-rotatedmarker'
  import '../../components/maps/leaflet-sidepanel.min.js'
  import { defaultBaseMapType, baseMaps, overlayMaps, boatMarkerTypes } from '../../components/maps/leafletHelpers.js'

  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { setAppTitle } from '../../utils/app.js'
  import PostgSail from '../../services/api-client'
  import { useCacheStore } from '../../stores/cache-store'
  import { dateFormatUTC, durationFormatHours, durationI18nHours, dateFormatTime } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { awaFormat, angleFormat } from '../../utils/angleFormatter.js'
  import { useModal, useToast } from 'vuestic-ui'
  const { confirm } = useModal()
  const { init: initToast } = useToast()
  import logBook from '../../data/logbook.json'
  import { useGlobalStore } from '../../stores/global-store'
  import { useVesselStore } from '../../stores/vessel-store'

  const { t } = useI18n()

  const { readOnly, currentTheme } = useGlobalStore()
  const { vesselName, vesselType } = useVesselStore()

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
  })
  const mapContainer = ref(),
    map = ref(),
    sidepanel = ref(),
    speed_arr = ref([]),
    wind_arr = ref([]),
    labels_arr = ref([]),
    GeoJSONfeatures = ref(),
    GeoJSONbasemapObj = ref({})

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
    const id = route.params.id
    try {
      const response = await CacheStore.getAPI('log_get', id)
      apiData.row = response[0]
      formData.name = apiData.row.name || null
      formData.notes = apiData.row.notes || null
      formData.geojson = apiData.row.geojson || null
      cloudCoverage.value = apiData.row?.extra?.observations?.cloudCoverage || -1
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
      map_setup()
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
  const cloudCoverage = ref(-1)
  const map_setup = () => {
    GeoJSONfeatures.value = mapGeoJsonFeatures.value
    let centerLat = 0
    let centerLng = 0
    if (mapGeoJsonFeatures.value && mapGeoJsonFeatures.value.geometry) {
      centerLat = mapGeoJsonFeatures.value.geometry.coordinates[1]
      centerLng = mapGeoJsonFeatures.value.geometry.coordinates[0]
    }

    if (mapGeoJsonFeatures.value && mapGeoJsonFeatures.value.length > 0) {
      const midPoint = Math.round(mapGeoJsonFeatures.value.length / 2)
      console.log(`${mapGeoJsonFeatures.value.length} ${midPoint}`)
      console.log(mapGeoJsonFeatures.value)
      centerLat = mapGeoJsonFeatures.value[midPoint].geometry.coordinates[1]
      centerLng = mapGeoJsonFeatures.value[midPoint].geometry.coordinates[0]
    }
    console.debug(`DetailsMap`, GeoJSONfeatures.value)
    if (centerLat == 0 && centerLng == 0) return

    console.debug(`DetailsMap centerLatLng: ${centerLat} ${centerLng}`)
    map.value = L.map(mapContainer.value, {
      zoomControl: false,
      zoomAnimation: false,
    }).setView([centerLat, centerLng], 17)
    // Add new Zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map.value)

    const bMaps = baseMaps()
    const oMaps = overlayMaps()
    bMaps[defaultBaseMapType()].addTo(map.value)

    L.control.layers(bMaps, oMaps).addTo(map.value)

    const popup = function (feature, layer) {
      if (feature.properties && feature.properties.time) {
        let status = feature.properties.status || ''
        let time = dateFormatUTC(feature.properties.time)
        let sog = speedFormatKnots(feature.properties.speedoverground)
        let cog = angleFormat(feature.properties.courseovergroundtrue)
        let twd = angleFormat(feature.properties.truewinddirection)
        let aws = speedFormatKnots(feature.properties.windspeedapparent)
        let awa = awaFormat(feature.properties.truewinddirection, feature.properties.courseovergroundtrue)
        let latitude = parseFloat(feature.properties.latitude).toFixed(3)
        let longitude = parseFloat(feature.properties.longitude).toFixed(3)
        let text = `<div class='mpopup' id='${time}'><h4>${vesselName}: ${status}</h4><br/>
                      <table class='data'><tbody>
                        <tr><td>Time</td><td>${time}</td></tr>
                        <tr><td>Position</td><td>${latitude} ${longitude}</td></tr>`
        if (feature.properties.speedoverground) {
          text += `<tr><td>Speed</td><td>${sog}`
          if (feature.properties.courseovergroundtrue) {
            text += ` / ${cog}`
          }
          text += `</td></tr>`
        }
        if (feature.properties.windspeedapparent) {
          text += `<tr><td>Wind</td><td>${aws}`
          if (feature.properties.truewinddirection) {
            text += ` / ${twd}`
          }
          text += `</td></tr>`
        }
        if (feature.properties.truewinddirection && feature.properties.courseovergroundtrue) {
          text += `<tr><td>AWA</td><td>${awa}</td></tr>`
        }
        text += `</tbody></table></div><br/>`
        // Form content
        let content =
          text +
          'Notes:<br/>' +
          "<textarea style='box-sizing: border-box;border-width: 1px;' id='noteTextarea' rows='4' cols='30'>" +
          feature.properties.notes +
          '</textarea><br>' +
          "<div class='center'><button class='save' onclick='saveNote(" +
          JSON.stringify(feature.geometry.coordinates) +
          ")'>Save</button>" +
          "<button class='delete' onclick='deletePoint(" +
          JSON.stringify(feature.geometry.coordinates) +
          ")'>Delete</button></div>"
        layer.bindPopup(content)

        // Save note to GeoJSON properties
        window.saveNote = async function (coordinates) {
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
        window.deletePoint = async function (coordinates) {
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
                return feature.geometry.coordinates.length > 0
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
          document.getElementById('mapContainer').style.display = ''
          console.log('deletePoint done')
        }
      }
      // If geo LineString click
      if (feature.properties && feature.properties._from_time) {
        //console.log(`popup`, feature.properties)
        // Those value are read directly from the geojson so they are unformatted.
        // We could used the log details item ref for performance
        let time = dateFormatUTC(feature.properties._from_time)
        let avg_speed = speedFormatKnots(feature.properties.avg_speed)
        let duration = durationFormatHours(feature.properties.duration)
        let distance = distanceFormatMiles(feature.properties.distance)
        let text = `<div class='center'><h4>${feature.properties.name}</h4></div><br/>
                Time: ${time}<br/>
                Average Speed: ${avg_speed}<br/>
                Duration: ${duration}<br/>
                Distance: ${distance}<br/>
                Notes: ${feature.properties.notes}<br/>`
        layer.bindPopup(text)
        layer.LineString = true // tag the layer to find it when name or notes is updated
        //console.log(layer)
      }
    }

    const boatTypes = boatMarkerTypes()

    GeoJSONbasemapObj.value = {
      Sailboat: L.geoJSON(mapGeoJsonFeatures.value, {
        pointToLayer: boatTypes['Sailboat'],
        onEachFeature: popup,
      }),
      SailboatSails: L.geoJSON(mapGeoJsonFeatures.value, {
        pointToLayer: boatTypes['SailboatSails'],
        onEachFeature: popup,
      }),
      Powerboat: L.geoJSON(mapGeoJsonFeatures.value, {
        pointToLayer: boatTypes['Powerboat'],
        onEachFeature: popup,
      }),
      Dot: L.geoJSON(mapGeoJsonFeatures.value, {
        pointToLayer: boatTypes['Dot'],
        onEachFeature: popup,
      }),
    }
    L.control.layers(GeoJSONbasemapObj.value).addTo(map.value)
    const boatLayer =
      vesselType === 'Sailing'
        ? GeoJSONbasemapObj.value['Sailboat']
        : vesselType === 'Pleasure Craft'
        ? GeoJSONbasemapObj.value['Powerboat']
        : GeoJSONbasemapObj.value['Dot']
    boatLayer.addTo(map.value)
    map.value.fitBounds(boatLayer.getBounds(), { maxZoom: 17, zoomControl: false })
    // Update default layer icon
    document.getElementsByClassName('leaflet-control-layers-toggle')[1].style =
      "background-image: url('/favicon-32x32.png');"

    /*
    // Add geoJSON
    //console.log(geojson.length)
    GeoJSONlayer.value = L.geoJSON(mapGeoJsonFeatures.value, {
      pointToLayer: BoatIcon,
      onEachFeature: popup,
    }).addTo(map.value)
    map.value.fitBounds(GeoJSONlayer.value.getBounds(), { maxZoom: 17, zoomControl: false })
    */

    // Add sidepanel
    sidepanel.value = L.control
      .sidepanel('sidepanel', {
        panelPosition: 'left',
        hasTabs: true,
        tabsPosition: 'top',
        pushControls: true,
        darkMode: currentTheme === 'dark',
        startTab: 'tab-1',
      })
      .addTo(map.value)

    // Custom control for external link
    var externalLinkControl = L.control({ position: 'bottomright' })
    externalLinkControl.onAdd = function () {
      var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      div.innerHTML = `<a href="/maplapse/${item.value.id}?height=100vh" target="_blank"><i class="va-icon fa fa-external-link" style="font-size: 14px; height: 14px; line-height: 14px;" aria-hidden="true" notranslate=""><!----></i></a>`
      // Adding tooltip
      div.title = 'Extended map'
      return div
    }
    externalLinkControl.addTo(map.value)
  } // end map setup

  const confirmDeleteTrackpoint = async () => {
    console.log('confirmDeleteTrackpoint')
    document.getElementById('mapContainer').style.display = 'none'
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
      document.getElementById('mapContainer').style.display = ''
      initToast('Operation cancel')
    }

    return canDelete
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
    document.getElementById('mapContainer').style.display = 'none'
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
      document.getElementById('mapContainer').style.display = ''
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
</script>

<style lang="scss">
  .leaflet-map {
    width: 100%;
    height: calc(100vh - 4.5rem);
  }
  .sidepanel {
    width: 350px;
    .sidepanel-content {
      width: 350px;
    }
  }
  .sidebar-tab-link.active,
  .sidebar-tab-link:hover {
    color: var(--va-primary) !important;
    border-bottom-color: var(--va-primary) !important;
  }
  .mpopup {
    td:nth-child(1) {
      text-align: right;
      padding-right: 5px;
    }
    td:nth-child(2) {
      font-weight: bold;
    }
  }
  .save {
    width: 50%;
    padding: 5px;
    color: white;
    background-color: blue;
  }
  .delete {
    width: 50%;
    color: white;
    background-color: red;
    padding: 5px;
  }
  .va-dropdown__content.va-select-dropdown__content.va-dropdown__content-wrapper {
    z-index: 9999 !important;
  }
</style>
