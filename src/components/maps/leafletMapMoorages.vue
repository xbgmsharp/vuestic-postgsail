<template>
  <div class="leaflet-maps-page">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-card class="leaflet-maps-page__widget">
      <template v-if="moorageMapId == 0">
        <div id="sidepanel" class="sidepanel" aria-label="side panel" aria-hidden="false">
          <div class="sidepanel-inner-wrapper">
            <nav class="sidepanel-tabs-wrapper" aria-label="sidepanel tab navigation">
              <ul class="sidepanel-tabs">
                <li v-for="(tab, index) in tabs" :key="index" class="sidepanel-tab">
                  <a :href="'#' + tab" class="sidebar-tab-link" role="tab" :data-tab-link="'tab-' + (index + 1)">
                    {{ $t('moorages.list.title') }}
                  </a>
                </li>
              </ul>
            </nav>
            <div class="sidepanel-content-wrapper">
              <div class="sidepanel-content">
                <div
                  v-for="(tab, index) in tabs"
                  :key="index"
                  class="sidepanel-tab-content"
                  :data-tab-content="'tab-' + (index + 1)"
                >
                  <div v-for="(moorage, index) in mooragesList" :key="index">
                    <ol>
                      <li>
                        {{ index + 1 }}.
                        <a class="va-link" @click="navigateMoorage(moorage.geometry.coordinates, index)">{{
                          moorage.properties.name
                        }}</a>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="sidepanel-toggle-container">
            <button class="sidepanel-toggle-button" type="button" aria-label="toggle side panel"></button>
          </div>
        </div>
      </template>
      <div ref="mapContainer" style="height: 100%" class="leaflet-map h-full" />
    </va-card>
  </div>
</template>

<script setup>
  /*
   * TODO
   * Add boat name
   * Add motorboat icon
   */
  import 'leaflet/dist/leaflet.css'
  import './leaflet-sidepanel.css'
  import * as L from 'leaflet'
  import './leaflet-sidepanel.min.js'

  import { defaultBaseMapType, fallbackBaseMapType, baseMaps, overlayMaps } from './leafletHelpers.js'

  import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
  import PostgSail from '../../services/api-client'
  import mooragesGeoJSON from '../../data/moorages_map.json'

  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { stayed_at_options } from '../../utils/PostgSail.ts'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  const isBusy = ref(false),
    apiError = ref(null),
    mapContainer = ref(),
    map = ref(),
    moorages_map = ref(),
    outbound_logs_map = ref(),
    inbound_logs_map = ref(),
    markersMap = ref([])

  const props = defineProps({
    moorageMapId: {
      type: Number,
      default: 0,
      required: false,
    },
    mapZoom: {
      type: Number,
      default: 17,
    },
    controlLayer: {
      type: Boolean,
      default: true,
    },
    mapType: {
      type: String,
      default: defaultBaseMapType(),
    },
  })
  console.log(
    'props moorageMapId,mapZoom,controlLayer,mapType',
    props.moorageMapId,
    props.mapZoom,
    props.controlLayer,
    props.mapType,
  )
  const tabs = ['moorages']

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.moorages_export_geojson()
      if (response && response.geojson?.features) {
        moorages_map.value = response.geojson
        map_setup()
      } else {
        console.warn('error moorages_map', response)
        // If empty data, display a world map.
        if (!response.geojson?.features) {
          console.warn('no data')
          map.value = L.map(mapContainer.value).setView([0, 0], 1)
          const bMaps = baseMaps()
          bMaps[fallbackBaseMapType()].addTo(map.value)
          return
        }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Get sample data from local json...', apiError.value)
        moorages_map.value = mooragesGeoJSON
        map_setup()
      }
    } finally {
      isBusy.value = false
    }
  })

  const map_setup = () => {
    const geojson = moorages_map.value
    let coord = geojson.features[0].geometry.coordinates
    if (props.moorageMapId != 0) {
      coord = geojson.features.filter((geog) => geog.properties.id == props.moorageMapId)[0].geometry.coordinates
    }
    map.value = L.map(mapContainer.value, { zoomControl: false }).setView(coord, props.mapZoom)

    const bMaps = baseMaps()
    const oMaps = overlayMaps()
    bMaps[props.mapType].addTo(map.value)

    if (props.controlLayer) {
      L.control.layers(bMaps, oMaps).addTo(map.value)
      L.control.zoom({ position: 'bottomright' }).addTo(map.value)
    }

    let multiplier = Math.max(map.value.getZoom(), 1)
    multiplier = Math.min(map.value.getZoom(), 9)
    console.log('multiplier', multiplier)
    const markerIcon = function (feature, latlng) {
      if (feature.properties.stay_code == 3) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [multiplier * 4, multiplier * 4],
            iconAnchor: [multiplier * 2, multiplier * 2],
            iconUrl: '/mooring_icon.png',
            popupAnchor: [0, 0],
          }),
        })
      }
      if (feature.properties.stay_code == 4) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [multiplier * 4, multiplier * 4],
            iconAnchor: [multiplier * 2, multiplier * 2],
            iconUrl: '/dock_icon.png',
            popupAnchor: [0, 0],
          }),
        })
      }
      return L.marker(latlng, {
        icon: new L.Icon({
          iconSize: [multiplier * 4, multiplier * 4],
          iconAnchor: [multiplier * 2, multiplier * 2],
          iconUrl: '/anchoricon.png',
          popupAnchor: [0, 0],
        }),
      })
    }

    const onEachMoorageFeaturePopup = function (feature, layer) {
      var popupContent =
        '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
      if (feature.properties && feature.properties.id) {
        let popup = `<div class='mpopup'><center><h4><a href="/moorage/${feature.properties.id}">${feature.properties.name}</a></h4></center>`
        popup += '<table class="data">'
        popup += '<tr><th>Visits</th><td><a href="/moorage/arrivals-departures/' + feature.properties.id + '">'
        popup += `${feature?.properties?.reference_count}`
        popup += '</a></td></tr>'
        popup += '<tr><th>Stays</th><td>'
        popup +=
          '<a href="/stays/moorage/' + feature.properties.id + '">' + (feature?.properties?.total_stay || 0) + ' day'
        if ((feature?.properties?.total_stay || 0) > 1) popup = popup + 's'
        popup = popup + '</a></td></tr>'
        //popup += `Preference: ${feature.properties.stay_code}`
        popup += '<tr><th>Preference</th><td>' + stayed_at_options[feature.properties.stay_code - 1].text + '</td></tr>'
        if (feature?.properties?.notes) {
          popup += '<tr><th>Notes</th><td>' + feature?.properties?.notes + '</td></tr>'
        }
        popup += '</table></div>'
        popupContent = popup
      }
      layer.bindPopup(popupContent)
      layer.on({ click: whenClicked })
      markersMap.value.push(layer)
    }

    const layer = L.geoJSON(geojson, {
      pointToLayer: markerIcon,
      onEachFeature: onEachMoorageFeaturePopup,
    }).addTo(map.value)

    map.value.fitBounds(layer.getBounds(), { maxZoom: 17 })
    if (props.moorageMapId != 0) {
      map.value.flyTo(coord.reverse(), props.mapZoom)
    }
    // only for moorages maps
    if (props.moorageMapId == 0) {
      // Create sidebar
      L.control
        .sidepanel('sidepanel', {
          panelPosition: 'left',
          hasTabs: true,
          tabsPosition: 'top',
          pushControls: true,
          //darkMode: currentTheme === 'dark',
          startTab: 'tab-1',
        })
        .addTo(map.value)
      // open the sidepanel onload
      map.value.whenReady(function () {
        var toggleButton = document.querySelector('.sidepanel-toggle-button')
        if (toggleButton) {
          toggleButton.click()
        }
      })
    }
  }

  // TODO Zoom and fit on click
  const onEachLineStringFeaturePopup = function (feature, layer) {
    var popupContent = '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
    if (feature.properties && feature.properties._from_time) {
      let time = dateFormatUTC(feature.properties._from_time)
      let duration = durationFormatHours(feature.properties.duration)
      let distance = distanceFormatMiles(feature.properties.distance)
      let avg_speed = speedFormatKnots(feature.properties.avg_speed)
      let max_speed = speedFormatKnots(feature.properties.max_speed)
      let max_wind = speedFormatKnots(feature.properties.max_wind_speed)
      let notes = feature.properties?.notes || ''
      let text = `<div class='mpopup'>
                        <h4><a href="/log/${feature.properties.id}">${feature.properties.name}</a></h4><br/>
                        <table class='data'><tbody>
                          <tr><td>Time</td><td>${time}</td></tr>
                          <tr><td>Distance</td><td>${distance}</td></tr>
                          <tr><td>Duration</td><td>${duration} hours</td></tr>
                          <tr><td>Speed</td><td>avg ${avg_speed} / max ${max_speed}</td></tr>
                          <tr><td>Wind</td><td>max ${max_wind}</td></tr>
                          <tr><th>Notes</th><td>${notes}</td></tr>'
                        </tbody></table></br>
                        <a href="/timelapse/${feature.properties.id}">Replay</a>
                      </div>`
      popupContent = text
    }
    layer.bindPopup(popupContent)
  }

  const GetStyle = function (feature) {
    return {
      color: 'blue',
    }
  }

  // https://leafletjs.com/examples/geojson/
  // https://leafletjs.com/examples/choropleth/
  // TODO Zoom and fit on click
  const whenClicked = async (e) => {
    // e = event
    console.log('event whenClicked', e)
    if (outbound_logs_map.value) {
      map.value.removeLayer(outbound_logs_map.value)
    }
    if (inbound_logs_map.value) {
      map.value.removeLayer(inbound_logs_map.value)
    }
    const layer = e.target
    outbound_logs_map.value = await log_from_moorage_geojson(layer.feature.properties.id)
    L.geoJSON(outbound_logs_map.value, { style: { color: 'blue' }, onEachFeature: onEachLineStringFeaturePopup }).addTo(
      map.value,
    )
    inbound_logs_map.value = await log_to_moorage_geojson(layer.feature.properties.id)
    L.geoJSON(inbound_logs_map.value, { style: { color: 'red' }, onEachFeature: onEachLineStringFeaturePopup }).addTo(
      map.value,
    )
  }

  const log_from_moorage_geojson = async (id) => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const payload = {
      _id: id,
    }
    try {
      const response = await api.find_log_from_moorage_fn(payload)
      if (response && response.geojson?.features) {
        return response.geojson
      } else {
        console.error('error find_log_from_moorage_fn', response)
        apiError.value = 'error find_log_from_moorage_fn'
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      console.warn('Error...', apiError.value)
    } finally {
      isBusy.value = false
    }
  }

  const log_to_moorage_geojson = async (id) => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const payload = {
      _id: id,
    }
    try {
      const response = await api.find_log_to_moorage_fn(payload)
      if (response && response.geojson?.features) {
        return response.geojson
      } else {
        if (!response.geojson?.features) {
          return // no error if no data
        }
        console.error('error find_log_to_moorage_fn', response)
        apiError.value = 'error find_log_to_moorage_fn'
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      console.warn('Error...', apiError.value)
    } finally {
      isBusy.value = false
    }
  }

  const mooragesList = computed(() => {
    if (!moorages_map.value?.features) return []
    return moorages_map.value.features.filter((feature) => feature.geometry.type === 'Point').map((feature) => feature)
  })
  const navigateMoorage = (coordinates, index) => {
    function openPopupClick() {
      //markersMap.value[index].openPopup()
      markersMap.value[index].fire('click', index)
      map.value.off('moveend', openPopupClick)
    }
    console.log(`navigate to Moorage: ${coordinates}`)
    map.value.flyTo(coordinates.reverse(), 15)
    map.value.on('moveend', openPopupClick)
  }

  onBeforeUnmount(async () => {
    if (map.value) {
      map.value.remove()
    }
  })
</script>

<style lang="scss">
  .mpopup {
    td:nth-child(1) {
      text-align: right;
      padding-right: 5px;
    }
    td:nth-child(2) {
      font-weight: bold;
    }
    a {
      cursor: pointer;
    }
  }
</style>
