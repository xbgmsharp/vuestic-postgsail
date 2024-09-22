<script setup>
  import { onMounted, ref } from 'vue'
  import { GeoJsonLayer } from '@deck.gl/layers'
  import { MapboxOverlay } from '@deck.gl/mapbox'
  import PostgSail from '../../../services/api-client'
  import maplibregl from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'

  const isBusy = ref(false)
  const apiError = ref(null)
  const mapgl_geojson = ref({})
  const mapContainer = ref()
  const map = ref()
  let popup = null // Popup instance
  const customIconUrl = '/dock_icon.png'

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
    const coords = mapgl_geojson.value.features[0].geometry.coordinates[0]

    map.value = new maplibregl.Map({
      container: 'logs-map-gl',
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [coords[0], coords[1]],
      zoom: 5,
    })

    await map.value.once('load')

    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: [
        new GeoJsonLayer({
          id: 'GeoJsonLayer',
          data: mapgl_geojson.value,
          extruded: true,
          filled: true,
          getElevation: 30,
          getFillColor: [160, 160, 180, 200],
          getLineColor: (f) => {
            if (f.properties.distance) {
              return random_rgb_dark()
            } else {
              return [0, 0, 0]
            }
          },
          getLineWidth: 20,
          getPointRadius: 4,
          getText: (f) => f.properties.name,
          getTextSize: 12,
          lineWidthMinPixels: 2,
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

          // Handle the click event on the layer using onClick
          onClick: (info, event) => {
            console.log(info, event)
            if (info && info.object) {
              const feature = info.object

              // Get coordinates of the clicked feature
              const [lng, lat] = info.coordinate

              // Remove existing popup
              if (popup) {
                popup.remove()
              }

              // Create a new popup
              popup = new maplibregl.Popup({ closeOnClick: true })
                .setLngLat([lng, lat])
                .setHTML(
                  `<p>${feature.properties.name || 'Unnamed Feature'}</p>
                             <p>Duration:${feature.properties.duration}</p>`,
                )
                .addTo(map.value)
            }
          },
        }),
      ],
      getTooltip: ({ object }) => object && getTooltip(object),
    })

    map.value.addControl(deckOverlay)

    /*
    // Add click event to display popup on left click
    map.value.on('click', (event) => {
      const [longitude, latitude] = event.lngLat.toArray()

      // Use Deck.gl picking to find the object under the click
      const picked = deckOverlay.pickObject({
        x: event.point.x,
        y: event.point.y,
      })

      if (picked && picked.object) {
        const feature = picked.object

        // Remove any existing popup
        if (popup) {
          popup.remove()
        }

        // Create a new popup
        popup = new maplibregl.Popup({ closeOnClick: true })
          .setLngLat([longitude, latitude])
          .setHTML(
            `
            <div>
              <strong>${feature.properties.name}</strong><br/>
              ${feature.properties.distance ? `Distance: ${feature.properties.distance}` : ''}<br/>
              ${feature.properties.duration ? `Duration: ${feature.properties.duration}` : ''}
            </div>
          `,
          )
          .addTo(map.value)
      }
    })*/
  })

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return [o(r() * s), o(r() * s), o(r() * s)]
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
  <div id="logs-map-gl" ref="logs-map-gl"></div>
</template>

<style lang="scss">
  #logs-map-gl {
    width: 100%;
    height: 80vh;
    position: relative;
  }

  /* Fix the popup appearance */
  .maplibregl-popup-content {
    background-color: white !important; /* Ensure a solid background */
    color: black !important; /* Set proper text color */
    padding: 10px !important; /* Add some padding for spacing */
    border-radius: 5px !important; /* Optional: rounded corners */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important; /* Add a shadow for depth */
  }

  /* Ensure the popup container is on top of other elements */
  .maplibregl-popup {
    z-index: 1000 !important;
  }
</style>
