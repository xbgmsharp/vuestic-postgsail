<script setup>
  import { onMounted, ref } from 'vue'
  import maplibregl from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'
  import { GeoJsonLayer } from '@deck.gl/layers'
  import { MapboxOverlay } from '@deck.gl/mapbox'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { stayed_at_options } from '../../utils/PostgSail.ts'

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
            // Add default icon is anchor
            return { id: 'anchor', url: '/anchoricon.png', width: 32, height: 32 }
            //return f.properties.stay_code ? customIconUrl : null // Only set custom icon if property exists
          },
          getIconSize: 4,
          iconSizeScale: 4,
          iconSizeMinPixels: 12,

          /* Bug only work on right click
          // Handle the click event on the layer using onClick
          onClick: (info, event) => {
            console.log(info, event)
            if (info && info.object) {
              const feature = info.object

              // Get coordinates of the clicked feature
              const [lng, lat] = info.coordinate
              // Get description
              const description = getOnClickDesc(feature)

              // Remove existing popup
              if (popup) {
                popup.remove()
              }

              // Create a new popup
              popup = new maplibregl.Popup({ closeOnClick: true })
                .setLngLat([lng, lat])
                .setHTML(description)
                .addTo(map.value)
            }
          },
          */
        }),
      ],
      getTooltip: ({ object }) => object && getTooltip(object),
    })

    map.value.addControl(deckOverlay)

    // Solve bug left click
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
        const description = getOnClickDesc(feature)

        // Remove any existing popup
        if (popup) {
          popup.remove()
        }

        // Create a new popup
        popup = new maplibregl.Popup({ closeOnClick: true })
          .setLngLat([longitude, latitude])
          .setHTML(description)
          .addTo(map.value)
      }
    })
  })

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return [o(r() * s), o(r() * s), o(r() * s)]
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
      let notes = feature.properties?.notes || ''
      let text = {
        html: `<div class='mpopup'>
                        <h4>${feature.properties.name}</a><br/>
                        <table class='data'><tbody>
                          <tr><td>Time</td><td>${time}</td></tr>
                          <tr><td>Distance</td><td>${distance}</td></tr>
                          <tr><td>Duration</td><td>${duration} hours</td></tr>
                          <tr><td>Speed</td><td>avg ${avg_speed} / max ${max_speed}</td></tr>
                          <tr><td>Wind</td><td>max ${max_wind}</td></tr>
                          <tr><td>Notes</td><td>${notes}</td></tr>
                        </tbody></table></br>
                      </div>`,
      }
      return text
    }
  }

  function getOnClickDesc(feature) {
    // Is moorage
    if (feature.properties.stay_code) {
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
      return popup
    } else {
      // is logbook
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
                          <tr><td>Notes</td><td>${notes}</td></tr>
                        </tbody></table></br>
                        <a href="/timelapse/${feature.properties.id}">Replay</a>
                      </div>`
      return text
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
