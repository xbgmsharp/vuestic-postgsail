<script setup>
  /* eslint-disable */
  import { onMounted, ref } from 'vue'
  import * as L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import { LeafletLayer } from 'deck.gl-leaflet'
  import { MapView } from '@deck.gl/core'
  import { GeoJsonLayer } from '@deck.gl/layers'
  import PostgSail from '../../../services/api-client'

  const isBusy = ref(false)
  const apiError = ref(null)
  const mapgl_geojson = ref({})

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
    const coords = mapgl_geojson.value.features[0].geometry.coordinates[0].reverse()
    const map = L.map(document.getElementById('logs-map-gl'), {
      center: [coords[0], coords[1]],
      zoom: 5,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

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

          filled: true,
          pointRadiusUnits: 'pixels',
          pointType: 'circle+icon+text',
          stroked: false,
          pickable: true,

          // Set the icon based on feature properties
          getIcon: (f) => {
            console.log(f)
            if (!f.properties.stay_code) return null
            if (f.properties.stay_code == 3) {
              return { id: 'mooring', url: '/mooring_icon.png', width: 32, height: 32 }
            }
            if (f.properties.stay_code == 4) {
              return { id: 'dock', url: '/dock_icon.png', width: 32, height: 32 }
            }
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
            const hex = f.properties.color
            // convert to RGB
            //console.log(hex ? hex.match(/[0-9a-f]{2}/g).map((x) => parseInt(x, 16)) : [0, 0, 0])
            //console.log(random_rgb_dark())
            //return hex ? hex.match(/[0-9a-f]{2}/g).map((x) => parseInt(x, 16)) : [0, 0, 0]
            //return [0, 0, 0]
            //return random_rgb_dark()
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
          getText: (f) => f.properties.name,
          getTextSize: 12,
          pointRadiusUnits: 'pixels',
          lineWidthMinPixels: 2,

          // Add onClick handler for feature clicks
          onClick: (info, event) => {
            console.log(info, event)
            if (info && info.object) {
              const feature = info.object

              // Get coordinates of the clicked feature
              const [lng, lat] = info.coordinate

              // Create a Leaflet popup
              const popup = L.popup({ autoClose: false, closeOnClick: false })
                .setLatLng([lat, lng])
                .setContent(
                  `<p>${feature.properties.name || 'Unnamed Feature'}</p>
                             <p>Duration:${feature.properties.duration}</p>`,
                )
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

  function getTooltip(object) {
    if (object.properties.stay_code) {
      return `${object.properties.name} ${object.properties.stay_code}`
    } else {
      return `${object.properties.name} ${object.properties.distance} ${object.properties.duration}`
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
