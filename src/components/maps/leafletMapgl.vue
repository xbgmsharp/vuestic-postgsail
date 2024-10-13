<script setup>
  /* eslint-disable */
  import { onMounted, ref } from 'vue'
  import * as L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import { LeafletLayer } from 'deck.gl-leaflet'
  import { MapView } from '@deck.gl/core'
  import { GeoJsonLayer, TextLayer } from '@deck.gl/layers'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { baseMaps, overlayMaps } from './leafletHelpers.js'

  const isBusy = ref(false)
  const apiError = ref(null)
  const mapgl_geojson = ref({})
  const currentZoom = ref(6) // Track zoom level

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    try {
      const api = new PostgSail()
      const response = await api.logs_mapgl()
      if (response.geojson) {
        mapgl_geojson.value = response.geojson
        console.log('Logs mapgl geojson', mapgl_geojson.value)
      } else {
        throw { response }
      }
    } catch (e) {
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', e)
        mapgl_geojson.value = {}
      }
    } finally {
      isBusy.value = false
    }
    // Extract the first coordinates as a center
    const coords = mapgl_geojson.value.features[0].geometry.coordinates[0]
    const map = L.map(document.getElementById('logs-map-gl'), {
      center: [coords[1], coords[0]],
      zoom: currentZoom.value,
      zoomControl: false,
    })
    // Track zoom level and hide/show labels based on zoom
    map.on('zoomend', () => {
      currentZoom.value = map.getZoom()
    })
    const bMaps = baseMaps()
    const oMaps = overlayMaps()
    bMaps['CARTO'].addTo(map)
    L.control.layers(bMaps, oMaps).addTo(map)
    // Zoom to bottomright
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const deckLayer = new LeafletLayer({
      views: [
        new MapView({
          repeat: true,
        }),
      ],
      layers: [
        new GeoJsonLayer({
          id: 'GeoJsonLayer',
          data: mapgl_geojson.value,
          controller: true,
          filled: true,
          pointRadiusUnits: 'pixels',
          pointType: 'circle+icon+text',
          stroked: false,
          pickable: true,

          // Set the icon based on feature properties
          getIcon: (f) => {
            //console.log(f)
            if (!f.properties.stay_code) return null
            if (f.properties.stay_code == 3) {
              return { id: 'mooring', url: '/mooring_icon.png', width: 32, height: 32 }
            }
            if (f.properties.stay_code == 4) {
              return { id: 'dock', url: '/dock_icon.png', width: 32, height: 32 }
            }
            // Add default icon is anchor
            return { id: 'anchor', url: '/anchoricon.png', width: 32, height: 32 }
            //return f.properties.stay_code ? customIconUrl : null // Only set custom icon if property exists
          },
          getIconSize: 4,
          iconSizeScale: 4,
          iconSizeMinPixels: 12,

          extruded: true,
          getElevation: 30,
          getFillColor: [160, 160, 180, 200],
          getLineColor: (f) => {
            //console.log(f.properties)
            if (f.properties.distance) {
              const rgba = random_rgb_dark()
              //console.log(rgba)
              return rgba
            } else {
              return [0, 0, 0]
            }
          },
          getLineWidth: 20,
          getPointRadius: 4,
          sizeUnits: 'meters',
          getText: (f) => f.properties.name,
          getTextSize: 12,
          pointRadiusUnits: 'pixels',
          lineWidthMinPixels: 2,

          // Add onClick handler for feature clicks
          onClick: (info, event) => {
            //console.log(info, event)
            if (info && info.object) {
              const feature = info.object

              // Get coordinates of the clicked feature
              const [lng, lat] = info.coordinate
              // Get description
              const description = getOnClickDesc(feature)

              // Create a Leaflet popup
              const popup = L.popup({ autoClose: false, closeOnClick: false })
                .setLatLng([lat, lng])
                .setContent(description)
                .openOn(map)
            }
          },
        }),
      ],
      getTooltip: ({ object }) => object && getTooltip(object),
    })
    map.addLayer(deckLayer)

    //const featureGroup = L.featureGroup()
    //featureGroup.addLayer(L.marker([51.4709959, -0.4531566]))
    //map.addLayer(featureGroup)
  })

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return [o(r() * s), o(r() * s), o(r() * s)]
  }

  function random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255
    return [o(r() * s), o(r() * s), o(r() * s), r().toFixed(1)]
  }

  function getTooltip(feature) {
    if (feature.properties.stay_code) {
      let stay_type = ''
      if (feature.properties.stay_code == 2) {
        stay_type = ' stay at anchor'
      }
      if (feature.properties.stay_code == 3) {
        stay_type = ' stay at mooring buoy'
      }
      if (feature.properties.stay_code == 4) {
        stay_type = ' stay at dock'
      }
      return `${feature.properties.name} ${stay_type}`
    } else {
      // is logbook
      let time = dateFormatUTC(feature.properties._from_time)
      let duration = durationFormatHours(feature.properties.duration)
      let distance = distanceFormatMiles(feature.properties.distance)
      let avg_speed = speedFormatKnots(feature.properties.avg_speed)
      let max_speed = speedFormatKnots(feature.properties.max_speed)
      let max_wind = speedFormatKnots(feature.properties.max_wind_speed)
      let text = {
        html: `<div class='mpopup'>
                          <h4>${feature.properties.name}</a><br/>
                          <table class='data'><tbody>
                            <tr><td>Time</td><td>${time}</td></tr>
                            <tr><td>Distance</td><td>${distance}</td></tr>
                            <tr><td>Duration</td><td>${duration} hours</td></tr>
                            <tr><td>Speed</td><td>avg ${avg_speed} / max ${max_speed}</td></tr>
                            <tr><td>Wind</td><td>max ${max_wind}</td></tr>
                          </tbody></table></br>
                        </div>`,
      }
      return text
    }
  }

  function getOnClickDesc(feature) {
    // Is moorage
    if (feature.properties.stay_code) {
      let stay_type = ''
      if (feature.properties.stay_code == 2) {
        stay_type = ' stay at anchor'
      }
      if (feature.properties.stay_code == 3) {
        stay_type = ' stay at mooring buoy'
      }
      if (feature.properties.stay_code == 4) {
        stay_type = ' stay at dock'
      }
      return `<a href="/moorage/${feature.properties.id}">${feature.properties.name}</a> ${stay_type}`
    } else {
      // is logbook
      let time = dateFormatUTC(feature.properties._from_time)
      let duration = durationFormatHours(feature.properties.duration)
      let distance = distanceFormatMiles(feature.properties.distance)
      let avg_speed = speedFormatKnots(feature.properties.avg_speed)
      let max_speed = speedFormatKnots(feature.properties.max_speed)
      let max_wind = speedFormatKnots(feature.properties.max_wind_speed)
      let text = `<div class='mpopup'>
                          <h4><a href="/log/${feature.properties.id}">${feature.properties.name}</a></h4><br/>
                          <table class='data'><tbody>
                            <tr><td>Time</td><td>${time}</td></tr>
                            <tr><td>Distance</td><td>${distance}</td></tr>
                            <tr><td>Duration</td><td>${duration} hours</td></tr>
                            <tr><td>Speed</td><td>avg ${avg_speed} / max ${max_speed}</td></tr>
                            <tr><td>Wind</td><td>max ${max_wind}</td></tr>
                          </tbody></table></br>
                          <a href="/timelapse/${feature.properties.id}">Replay</a>
                        </div>`
      return text
    }
  }
</script>

<template>
  <div id="logs-map-gl"></div>
</template>

<style lang="scss">
  #logs-map-gl {
    width: 100%;
    height: 80vh;
    position: relative;
    z-index: 0; /* Ensure it's behind the popup */
  }
  #tooltip {
    pointer-events: none;
    position: absolute;
    z-index: 9;
    font-size: 12px;
    padding: 8px;
    background: #000;
    color: #fff;
    min-width: 160px;
    max-height: 240px;
    overflow-y: hidden;
  }
  #deck-tooltip {
    font-size: 0.8em;
    font-family: Helvetica, Arial, sans-serif;
  }
  .leaflet-popup {
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 1000; /* Ensure it appears on top */
  }
</style>
