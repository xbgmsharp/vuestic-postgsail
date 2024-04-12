<template>
  <div class="leaflet-maps" style="height: 100%">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-inner-loading :loading="item && isBusy">
      <va-card title="Leaflet Maps">
        <div id="sidebar" ref="sidebarContainer" class="leaflet-sidebar collapsed">
          <!-- Nav tabs -->
          <div class="leaflet-sidebar-tabs">
            <ul role="tablist">
              <!-- top aligned tabs -->
              <li>
                <a href="#home" role="tab"><VaIcon name="menu_open" /></a>
              </li>
              <!--
              <li class="disabled">
                <a href="#messages" role="tab"><VaIcon name="envelope" /></a>
              </li>
              -->
              <li>
                <a href="#messages" role="tab"><VaIcon name="envelope" /></a>
              </li>
              <li>
                <a href="#profile" role="tab"><VaIcon name="insights" /></a>
              </li>
            </ul>

            <ul role="tablist">
              <!-- bottom aligned tabs -->
              <li>
                <a href="#settings" role="tab"><i class="fa fa-gear"></i></a>
              </li>
            </ul>
          </div>

          <!-- Tab panes -->
          <div class="leaflet-sidebar-content">
            <div id="home" class="leaflet-sidebar-pane">
              <h1 class="leaflet-sidebar-header">
                Trip summary
                <div class="leaflet-sidebar-close"><VaIcon name="close" /></div>
              </h1>
              <template v-if="isLoggedIn">
                <VaInput
                  v-model="formData.name"
                  outline
                  :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                  class="text-lg p-2"
                  @change="handleSubmit"
                /> </template
              ><template v-else>
                {{ item.name }}
              </template>
              <VaDivider class="my-6" />
              <div class="text-lg" style="position: relative">
                <div style="position: absolute">
                  <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="150"
                    viewBox="0 0 69.000000 900.000000"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <g
                      transform="translate(0.000000,900.000000) scale(0.100000,-0.100000)"
                      fill="#145da0"
                      stroke="none"
                    >
                      <path
                        d="M218 8852 c-47 -22 -74 -47 -107 -97 -23 -35 -26 -50 -26 -126 0 -85 0 -86 43 -142 28 -38 57 -63 87 -77 24 -11 49 -29 55 -39 5 -11 10 -65 10 -120 0 -77 4 -103 16 -115 12 -12 20 -13 35 -6 21 12 22 13 21 130 0 101 10 121 68 139 54 16 118 75 142 131 23 52 26 156 6 192 -31 56 -84 112 -122 129 -55 25 -176 25 -228 1z"
                      />
                      <path
                        d="M296 7904 c-13 -13 -16 -41 -16 -155 0 -78 5 -149 10 -160 13 -23 33 -24 55 -3 22 23 21 296 -2 319 -18 19 -28 19 -47 -1z"
                      />
                      <path
                        d="M289 7339 c-17 -33 -8 -307 11 -319 19 -12 21 -12 40 0 12 7 16 37 18 141 5 168 -1 199 -33 199 -14 0 -29 -9 -36 -21z"
                      />
                      <path
                        d="M295 6790 c-8 -13 -7 -309 1 -321 10 -16 43 -9 54 10 15 28 13 294 -2 309 -15 15 -45 16 -53 2z"
                      />
                      <path
                        d="M297 6243 c-4 -3 -7 -80 -7 -169 0 -158 1 -163 22 -170 40 -12 48 17 48 165 0 160 -4 181 -34 181 -13 0 -26 -3 -29 -7z"
                      />
                      <path
                        d="M302 5688 c-17 -17 -17 -309 0 -326 16 -16 23 -15 42 4 13 13 16 42 16 163 0 145 -5 171 -35 171 -6 0 -16 -5 -23 -12z"
                      />
                      <path
                        d="M297 5133 c-4 -3 -7 -77 -7 -164 0 -146 1 -159 19 -169 15 -7 23 -6 35 6 13 13 16 42 16 159 0 79 -3 150 -6 159 -6 16 -45 22 -57 9z"
                      />
                      <path
                        d="M301 4576 c-8 -9 -11 -62 -9 -166 3 -130 6 -154 20 -163 12 -8 21 -7 32 2 13 11 16 39 16 165 0 151 -5 176 -36 176 -6 0 -17 -6 -23 -14z"
                      />
                      <path
                        d="M296 4014 c-3 -9 -6 -83 -6 -164 0 -133 2 -150 18 -159 11 -6 24 -6 35 0 15 9 17 28 17 159 0 81 -3 155 -6 164 -3 9 -16 16 -29 16 -13 0 -26 -7 -29 -16z"
                      />
                      <path
                        d="M301 3466 c-8 -9 -11 -62 -9 -166 3 -130 6 -154 20 -163 12 -8 21 -7 32 2 13 11 16 39 16 165 0 151 -5 176 -36 176 -6 0 -17 -6 -23 -14z"
                      />
                      <path
                        d="M297 2914 c-10 -10 -8 -306 2 -322 4 -8 19 -12 32 -10 l24 3 0 165 0 165 -25 3 c-14 2 -29 0 -33 -4z"
                      />
                      <path
                        d="M301 2356 c-8 -9 -11 -62 -9 -166 3 -135 5 -154 21 -164 15 -9 22 -7 37 12 16 19 18 39 16 161 -1 99 -5 143 -15 155 -16 20 -35 21 -50 2z"
                      />
                      <path
                        d="M296 1788 c-3 -13 -6 -85 -6 -160 0 -111 3 -140 16 -152 18 -18 23 -19 44 -6 12 7 16 39 18 154 2 93 -1 152 -8 165 -15 29 -56 28 -64 -1z"
                      />
                      <path
                        d="M296 1234 c-10 -27 -7 -284 4 -305 6 -10 19 -19 30 -19 11 0 24 9 30 19 15 28 13 294 -2 309 -17 17 -55 15 -62 -4z"
                      />
                      <path
                        d="M311 701 c-10 -6 -16 -33 -19 -75 -5 -79 -7 -80 -128 -40 -86 29 -114 28 -114 -7 0 -22 30 -84 66 -134 12 -16 34 -52 48 -80 15 -27 38 -68 51 -90 14 -22 31 -51 37 -65 23 -47 60 -90 79 -90 20 0 55 42 91 110 13 25 36 63 51 85 15 22 27 43 27 48 0 4 17 34 39 66 21 32 49 79 61 105 22 43 23 48 7 63 -15 15 -21 15 -89 -7 -40 -12 -89 -23 -108 -24 l-35 -1 -5 63 c-6 72 -24 95 -59 73z"
                      />
                    </g>
                  </svg>
                </div>
                <div class="ps-10 gap-6">
                  <div class="">{{ $t('logs.log.from') }}</div>
                  <div class="">
                    <router-link
                      v-if="typeof item.id !== 'undefined'"
                      class="va-text-bold va-link link"
                      :to="{ name: 'moorage-details', params: { id: item.from_moorage_id } }"
                    >
                      {{ item.from }}
                    </router-link>
                    <br />
                    {{ item.fromTime }}
                  </div>
                  <div class="">{{ $t('logs.log.to') }}</div>
                  <div class="">
                    <router-link
                      v-if="typeof item.id !== 'undefined'"
                      class="va-text-bold va-link link"
                      :to="{ name: 'moorage-details', params: { id: item.to_moorage_id } }"
                    >
                      {{ item.to }}
                    </router-link>
                    <br />
                    {{ item.toTime }}
                  </div>
                </div>
              </div>

              <VaDivider class="my-6" />
              <div class="">
                DISTANCE / DURATION
                <div class="grid grid-cols-3 gap-6 text-lg">
                  <VaIcon name="route" :size="32" class="" />
                  <div class="">{{ item.distance }} / {{ item.duration }}</div>
                  <div class="">
                    <template v-if="isLoggedIn">
                      <router-link
                        v-if="typeof item.id !== 'undefined'"
                        class="va-text-bold va-link link"
                        :to="{ name: 'timelapse-replay', params: { id: item.id } }"
                      >
                        timelapse
                      </router-link>
                      ,
                      <router-link
                        v-if="typeof item.id !== 'undefined'"
                        class="va-text-bold va-link link"
                        :to="{ name: 'headless-replay', params: { id: item.id }, query: { height: '100vh' } }"
                        target="_blank"
                      >
                        fullscreen
                      </router-link> </template
                    ><template v-else>
                      <router-link
                        v-if="typeof item.id !== 'undefined'"
                        class="va-text-bold va-link link"
                        :to="{
                          name: 'timelapse-replay',
                          params: { boat: publicVessel, id: item.id },
                        }"
                      >
                        timelapse
                      </router-link>
                      ,
                      <router-link
                        v-if="typeof item.id !== 'undefined'"
                        class="va-text-bold va-link link"
                        :to="{
                          name: 'headless-replay',
                          params: { boat: publicVessel, id: item.id },
                          query: { height: '100vh' },
                        }"
                        target="_blank"
                      >
                        fullscreen
                      </router-link>
                    </template>
                  </div>
                </div>
              </div>

              <VaDivider class="my-6" />
              <div class="">
                SPEED AVG / MAX
                <div class="grid grid-cols-2 gap-2">
                  <div class="">
                    <VaIcon name="speed" :size="32" class="" />
                  </div>
                  <div class="text-lg">{{ item.avg_speed }} / {{ item.max_speed }}</div>
                </div>
              </div>

              <VaDivider class="my-6" />
              <div class="">
                WIND AVG / MAX
                <div class="grid grid-cols-2 gap-2">
                  <VaIcon name="air" :size="32" class="" />
                  <div class="text-lg">TODO / {{ item.max_wind_speed }}</div>
                </div>
              </div>

              <VaDivider class="my-6" />
              <div class="">
                <template v-if="isLoggedIn">
                  <VaTextarea
                    v-model="formData.notes"
                    outline
                    :placeholder="$t('logs.log.remarks')"
                    style="width: 90%"
                    @change="handleSubmit"
                  /> </template
                ><template v-else>
                  {{ item.notes }}
                </template>
              </div>

              <VaDivider class="my-6" />
              <template v-if="updateError">
                <VaAlert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</VaAlert>
              </template>
              <template v-if="isLoggedIn">
                <!--
                <div class="flex flex-row pa-2">
                  <VaButton :disabled="!canSubmit" @click="handleSubmit">Save</VaButton>
                </div>
                -->
                <div class="flex flex-row pa-2">
                  <VaButton color="danger" @click="handleDelete(item)">Delete</VaButton>
                </div>
              </template>
            </div>

            <div id="messages" class="leaflet-sidebar-pane">
              <h1 class="leaflet-sidebar-header">
                Messages
                <div class="leaflet-sidebar-close"><VaIcon name="close" /></div>
              </h1>
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

            <div id="profile" class="leaflet-sidebar-pane">
              <h1 class="leaflet-sidebar-header">
                Performance
                <div class="leaflet-sidebar-close"><VaIcon name="close" /></div>
              </h1>
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
          </div>
        </div>

        <div id="mapContainer" ref="mapContainer" class="sidebar-map" style="height: 80vh" />
      </va-card>
    </va-inner-loading>
  </div>
</template>

<script setup>
  import 'leaflet/dist/leaflet.css'
  import 'leaflet-sidebar-v2/css/leaflet-sidebar.min.css'
  import * as L from 'leaflet'
  import 'leaflet-sidebar-v2'

  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/api-client'
  import { useCacheStore } from '../../stores/cache-store'
  import {
    dateFormatUTC,
    durationFormatHours,
    durationI18nHours,
    durationI18nDays,
    dateFormatTime,
  } from '../../utils/dateFormatter.js'
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

  import tripSummary from './sidebars/Summary.vue'
  import tripPerformance from './sidebars/Performance.vue'

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
    sidebarContainer = ref(),
    sidebar = ref(),
    speed_arr = ref([]),
    wind_arr = ref([]),
    labels_arr = ref([]),
    GeoJSONlayer = ref()

  const item = computed(() => {
    return apiData.row
      ? {
          id: apiData.row.id,
          name: apiData.row.name,
          from: apiData.row.from,
          to: apiData.row.to,
          fromTime: dateFormatUTC(apiData.row.started),
          toTime: dateFormatUTC(apiData.row.ended),
          distance: distanceFormat(apiData.row.distance),
          duration: durationFormatHours(apiData.row.duration) + ' ' + durationI18nHours(apiData.row.duration),
          notes: apiData.row.notes,
          geoJson: apiData.row.geojson,
          avg_speed: speedFormat(apiData.row.avg_speed),
          max_speed: speedFormat(apiData.row.max_speed),
          max_wind_speed: speedFormat(apiData.row.max_wind_speed),
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
  function delButton(event) {
    console.log(event)
    return false
  }
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
      formData.geojson = apiData.row.geojson || null
      cloudCoverage.value = apiData.row?.extra?.observations?.cloudCoverage || -1
      document.title = `${publicVessel}'s Trip From ${apiData.row.name}`
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
    let geojson = mapGeoJsonFeatures.value
    let centerLat = 0
    let centerLng = 0
    if (mapGeoJsonFeatures.value && mapGeoJsonFeatures.value.geometry) {
      centerLat = mapGeoJsonFeatures.value.geometry.coordinates[1]
      centerLng = mapGeoJsonFeatures.value.geometry.coordinates[0]
      geojson = mapGeoJsonFeatures.value
    }

    if (mapGeoJsonFeatures.value && mapGeoJsonFeatures.value.length > 0) {
      const midPoint = Math.round(mapGeoJsonFeatures.value.length / 2)
      console.log(`${mapGeoJsonFeatures.value.length} ${midPoint}`)
      console.log(mapGeoJsonFeatures.value)
      centerLat = mapGeoJsonFeatures.value[midPoint].geometry.coordinates[1]
      centerLng = mapGeoJsonFeatures.value[midPoint].geometry.coordinates[0]
      geojson = mapGeoJsonFeatures.value
    }
    console.debug(`DetailsMap`, geojson)
    if (centerLat == 0 && centerLng == 0) return

    console.debug(`DetailsMap centerLatLng: ${centerLat} ${centerLng}`)
    map.value = L.map(mapContainer.value, {
      zoomControl: false,
    }).setView([centerLat, centerLng], 17)
    //map.value = L.map(mapContainer.value, { zoomControl: false })
    // Add new Zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map.value)
    // OSM
    const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    })
    // OpenSeaMap
    const openseamap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
      maxZoom: 18,
    })
    // Satellite
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 17,
      },
    )
    // NOAA
    const noaa = L.tileLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
      attribution: 'NOAA',
      maxZoom: 18,
    })
    const cartodb = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
      maxZoom: 18,
    })

    const baseMaps = {
      OpenStreetMap: osm,
      Satellite: sat,
      NOAA: noaa,
      Carto: cartodb,
    }
    const overlays = {
      OpenSeaMap: openseamap,
    }
    L.control.layers(baseMaps, overlays).addTo(map.value)
    baseMaps['OpenStreetMap'].addTo(map.value)
    openseamap.addTo(map.value)
    const BoatIcon = function (feature, latlng) {
      /*return L.circleMarker(latlng, {
        radius: 2,
        fillColor: '#00FFFF',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      })*/
      return L.marker(latlng, {
        icon: new L.Icon({
          iconSize: [15, 30],
          iconAnchor: [7.5, 10],
          iconUrl: '/sailboaticon.png',
        }),
        rotationAngle: feature.properties.courseovergroundtrue,
      })
    }

    const popup = function (feature, layer) {
      /* Boat popup
                  Boat Name
          Time	13 minutes ago
          Boat Speed	0 knots
          Wind Speed	4 knots
          Latitude	41.3869066667
          Longitude	2.19916333333
          */
      /* Track popup
                  Boat Name
            Time	8/8/2022, 11:11:30 AM
            Boat Speed	4.2 knots
            Latitude	39.5302133333
            Longitude	2.34970166667
          */
      var popupContent =
        '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
      // If geo Point click
      if (feature.properties && feature.properties.time) {
        //console.log(`popup`, feature.properties)
        let time = dateFormatUTC(feature.properties.time)
        let speed = speedFormat(feature.properties.speedoverground) || 0
        let wind = speedFormat(feature.properties.windspeedapparent) || 0
        let latitude = parseFloat(feature.properties.latitude).toFixed(5)
        let longitude = parseFloat(feature.properties.longitude).toFixed(5)
        let text = `<div class='center' id='${time}'><h4>${publicVessel}</h4></div><br/>
              Time: ${time}<br/>
              Boat Speed: ${speed}<br/>
              Wind Speed ${wind}<br/>
              Latitude: ${latitude}<br/>
              Longitude: ${longitude}<br/>`
        // Form content
        var content =
          text +
          'Notes:<br/>' +
          "<textarea style='box-sizing: border-box;border-width: 1px;' id='noteTextarea' rows='4' cols='30'>" +
          feature.properties.notes +
          '</textarea><br>' +
          "<div class='center'><button class='save' onclick='saveNote()'>Save</button>" +
          "<button class='delete' onclick='deletePoint(" +
          JSON.stringify(feature.geometry.coordinates) +
          ")'>Delete</button></div>"

        layer.bindPopup(content)

        // Save note to GeoJSON properties
        window.saveNote = async function () {
          var note = document.getElementById('noteTextarea').value
          feature.properties.notes = note
          layer.closePopup()

          // Update GeoJSON layer on the map
          GeoJSONlayer.value.clearLayers()
          GeoJSONlayer.value.addData(geojson)
          console.log(geojson.length)
          console.log(geojson)
          const track_geojson = {
            type: 'FeatureCollection',
            features: geojson,
          }
          const isSaved = await handleSubmit(track_geojson)
          if (isSaved) {
            console.log('deletePoint saved')
          }
        }

        // Delete point from GeoJSON features
        window.deletePoint = async function (coordinates) {
          console.log('deletePoint to delete:', coordinates)
          const toDelete = await confirmDeleteTrackpoint()
          if (toDelete) {
            console.log('deletePoint confirmed continue')
            geojson = geojson.filter(function (feature) {
              if (feature.geometry.type === 'Point') {
                return JSON.stringify(feature.geometry.coordinates) !== JSON.stringify(coordinates)
              } else if (feature.geometry.type === 'LineString') {
                feature.geometry.coordinates = feature.geometry.coordinates.filter(function (lineStringCoords) {
                  return JSON.stringify(lineStringCoords) !== JSON.stringify(coordinates)
                })
                return feature.geometry.coordinates.length > 0
              }
              return true
            })
            GeoJSONlayer.value.clearLayers()
            GeoJSONlayer.value.addData(geojson)
            console.log(geojson.length)
            console.log(geojson)
            const track_geojson = {
              type: 'FeatureCollection',
              features: geojson,
            }
            const isSaved = await handleSubmit(track_geojson)
            if (isSaved) {
              console.log('deletePoint saved')
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
        let time = dateFormatUTC(feature.properties._from_time)
        let avg_speed = speedFormat(feature.properties.avg_speed)
        let duration = durationFormatHours(feature.properties.duration)
        let distance = parseFloat(feature.properties.distance).toFixed(5)
        let text = `<div class='center'><h4>${feature.properties.name}</h4></div><br/>
              Time: ${time}<br/>
              avg_speed: ${avg_speed}<br/>
              Duration: ${duration}<br/>
              Distance: ${distance}<br/>`
        layer.bindPopup(text)
      }
    }
    // Add geoJSON
    //console.log(geojson.length)
    GeoJSONlayer.value = L.geoJSON(geojson, {
      pointToLayer: BoatIcon,
      onEachFeature: popup,
    }).addTo(map.value)
    map.value.fitBounds(GeoJSONlayer.value.getBounds(), { maxZoom: 17, zoomControl: false })
    // Add sidebar
    sidebar.value = L.control
      .sidebar({
        autopan: false, // whether to maintain the centered map point when opening the sidebar
        closeButton: true, // whether to add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'left', // left or right
      })
      .addTo(map.value)

    /*
    // Custom control for external link
    var externalLinkControl = L.control({ position: 'bottomright' })
    externalLinkControl.onAdd = function () {
      var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      div.innerHTML =
        '<a href="https://iot.openplotter.cloud/Elysian/timelapse?color=yellow&amp;start_date=2021-05-01&amp;end_date=2021-11-01&amp;map_type=1&amp;speed=90&amp;delay=1&amp;zoom=11" target="_blank"><i class="va-icon fa fa-external-link" style="font-size: 14px; height: 14px; line-height: 14px;" aria-hidden="true" notranslate=""><!----></i></a>'
      // Adding tooltip
      div.title = 'Extended map'
      return div
    }
    externalLinkControl.addTo(map.value)
    */
  } // end map setup

  const confirmDeleteTrackpoint = async () => {
    console.log('confirmDeleteTrackpoint')
    sidebar.value.close()
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
    } else {
      isBusy.value = false
      sidebar.value.open('home')
      document.getElementById('mapContainer').style.display = ''
      initToast('Operation cancel')
    }

    return canDelete
  }

  const handleSubmit = async (local_geojson) => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      name: formData.name,
      notes: formData.notes,
      track_geojson: local_geojson,
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
    sidebar.value.close()
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
      sidebar.value.open('home')
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

  function createButton(label, cssClass, container, id) {
    var btn = L.DomUtil.create('button', cssClass, container)
    btn.setAttribute('type', 'button')
    btn.setAttribute('id', id)
    btn.innerHTML = label
    return btn
  }
</script>

<style>
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
</style>
