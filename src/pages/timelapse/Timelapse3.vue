<template>
  <div class="leaflet-maps" style="height: 100%">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-inner-loading :loading="isBusy">
      <va-card class="leaflet-maps-page__widget" title="Leaflet Maps">
        <div id="mapContainer" ref="mapContainer" class="leaflet-map h-full" />
      </va-card>
    </va-inner-loading>
  </div>
</template>

<script setup>
  import 'leaflet/dist/leaflet.css'
  import * as L from 'leaflet'
  import 'leaflet-rotatedmarker'
  import 'leaflet.fullscreen'
  import {
    fallbackBaseMapType,
    baseMaps,
    boatMarkerTypes,
    powerBoatIcon,
    sailBoatIcon,
    sailBoatSailsIcon,
  } from '../../components/maps/leafletHelpers.js'

  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/api-client'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { angleFormat, awaFormat } from '../../utils/angleFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'

  //import { useGlobalStore } from '../../stores/global-store'
  //import timelapseGeoJSON from '../../data/timelapse3.json'
  //import { useI18n } from 'vue-i18n'
  //import { distanceLatLng } from '../../utils/distanceFormatter.js'
  //import noDataScreen from '../../components/noDataScreen.vue'

  function parseBoatTypeQueryParam(value, default_value) {
    if (value === undefined || value === null) {
      return default_value
    } else if (value in boatMarkerTypes()) {
      return value
    }
    return default_value
  }

  function parseMapTypeQueryParam(value, default_value) {
    if (value === undefined || value === null) {
      return default_value
    } else if (value === '0') {
      // map_type backward compatibility: was using numerical values initially
      value = 'OpenStreetMap'
    } else if (value === '1') {
      value = 'Satellite'
    }

    if (value in baseMaps()) {
      return value
    }
    return default_value
  }

  function parseBooleanQueryParam(value, default_value) {
    if (value === undefined || value === null) {
      return default_value
    } else if (value === 'true') {
      return true
    }
    return false
  }

  const route = useRoute(),
    //{ t } = useI18n(),
    //GlobalStore = useGlobalStore(),
    isBusy = ref(false),
    apiError = ref(null),
    mapContainer = ref(),
    map = ref(),
    polyLine = ref(),
    dotMarker = ref(null),
    boatMarker = ref(null),
    timelapse = ref(),
    stopped = ref(false),
    play_pause = ref(true)

  // Query-string
  // /timelapse?start_log=7953&end_log=7953&start_date=None&end_date=None&map_type=1&speed=250&delay=1&zoom=13
  // /timelapse?start_log=1&end_log=2
  // /timelapse?start_date=25-03-2023&end_date=25-03-2023
  // /timelapse?start_date=03-25-2023&end_date=03-25-2023
  // /timelapse?map_type=0
  // /timelapse?speed=100&delay=100&zoom=9
  const start_log = ref(route.query.start_log || route.params.id || null),
    end_log = ref(route.query.end_log || route.params.id || null),
    start_date = ref(route.query.start_date || null),
    end_date = ref(route.query.end_date || null),
    map_type = ref(parseMapTypeQueryParam(route.query.map_type, 'Satellite')),
    boat_type = ref(parseBoatTypeQueryParam(route.query.boat_type, 'Dot')),
    speed = ref(route.query.speed || 250),
    delay = ref(route.query.delay || 0),
    zoom = ref(route.query.zoom || 13),
    color = ref(route.query.color || 'dodgerblue'),
    map_height = ref(route.query.height || '80vh'),
    moorage_overlay = ref(parseBooleanQueryParam(route.query.moorage_overlay, true)),
    instruments = ref(parseBooleanQueryParam(route.query.instruments, false))

  // Ensure we have end_ parameter if there is a start_ parameter
  if (end_log.value === null && start_log.value != null) {
    end_log.value = start_log.value
  }
  if (end_date.value === null && start_date.value != null) {
    end_date.value = start_date.value
  }

  console.log(
    'Timelapse3 QS',
    start_log.value,
    end_log.value,
    start_date.value,
    end_date.value,
    map_type.value,
    speed.value,
    delay.value,
    zoom.value,
    color.value,
    map_height.value,
    moorage_overlay.value,
    instruments.value,
  )

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail(),
      payload = {
        start_log: start_log.value,
        end_log: end_log.value,
        start_date: start_date.value,
        end_date: end_date.value,
      }
    try {
      const response = await api.timelapse_by_points(payload)
      if (response && response.geojson?.features && response.geojson?.features[0]?.geometry?.coordinates) {
        timelapse.value = response.geojson
        patchLMapPositions()
        map_setup()
      } else {
        console.warn('error timelapse3', response)
        // If empty data, display a world map.
        if (response.geojson?.features && response.geojson.features[0].geometry.type == null) {
          console.warn('no data')
          map.value = L.map(mapContainer.value).setView([0, 0], 1)
          const bMaps = baseMaps()
          bMaps[fallbackBaseMapType()].addTo(map.value)
          return
        }
      }
    } catch (e) {
      apiError.value = e
    } finally {
      isBusy.value = false
    }
  })

  const map_track_setup = () => {
    const geojson = timelapse.value,
      coord_rev = geojson.features[0].geometry.coordinates.toReversed()
    map.value.setView(coord_rev, zoom.value)

    // Create the line
    polyLine.value = L.polyline([coord_rev], {
      weight: 3,
      color: color.value,
      opacity: 0.9,
    }).addTo(map.value)
    // Create the marker
    if (boat_type.value === 'Dot') {
      dotMarker.value = L.polyline([coord_rev, coord_rev], {
        weight: 8,
        color: 'red',
      }).addTo(map.value)
    }
    // Update map every x ms
    setTimeout(() => {
      map_update()
    }, 1000 + delay.value * 1000) //ms
  }

  const map_track_replay = () => {
    map.value.removeLayer(polyLine.value)
    if (dotMarker.value) {
      map.value.removeLayer(dotMarker.value)
    }
    if (boatMarker.value) {
      map.value.removeLayer(boatMarker.value)
    }
    stopped.value = false
    map_track_setup()
  }

  const map_setup = () => {
    const geojson = timelapse.value

    // The geoJSon only contains Geometry Point
    if (geojson.features[0].geometry.type != 'Point') return

    map.value = L.map(mapContainer.value)

    const bMaps = baseMaps()
    bMaps[map_type.value].addTo(map.value)

    // create a fullscreen button and add it to the map
    L.control
      .fullscreen({
        position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
        content: '<i class="va-icon material-icons">fullscreen</i>', // change the content of the button, can be HTML, default null
      })
      .addTo(map.value)
    // Add the note player and distance info to the map
    const legend = L.control({ position: 'bottomcenter' })
    legend.onAdd = function () {
      const legendView = L.DomUtil.create('div', 'legend')
      const topRow = L.DomUtil.create('div', 'top-row', legendView)
      L.DomUtil.create('span', 'distance', topRow)
      var player = L.DomUtil.create('span', 'player', topRow)
      player.addEventListener('click', () => {
        playAndPause('myevent')
      })
      const bottomRow = L.DomUtil.create('div', 'bottom-row', legendView)
      L.DomUtil.create('span', 'datetime', bottomRow)
      return legendView
    }
    legend.addTo(map.value)

    // Add the note overlay to the map
    const overlay = L.control({ position: 'topcenter' })
    overlay.onAdd = function () {
      const overlayView = L.DomUtil.create('div', 'overlay')
      const topRow = L.DomUtil.create('b', 'top-row', overlayView)
      L.DomUtil.create('span', 'trip', topRow)
      const bottomRow = L.DomUtil.create('div', 'bottom-row', overlayView)
      L.DomUtil.create('span', 'note', bottomRow)
      return overlayView
    }
    overlay.addTo(map.value)

    const instOverlay = L.control({ position: 'topright' })
    instOverlay.onAdd = function () {
      const overlayView = L.DomUtil.create('div', 'instruments')
      const speedView = L.DomUtil.create('div', 'speed', overlayView)
      var label = L.DomUtil.create('span', 'label', speedView)
      label.innerHTML = 'Speed:'
      L.DomUtil.create('b', 'value', speedView)
      const awaView = L.DomUtil.create('div', 'awa', overlayView)
      label = L.DomUtil.create('span', 'label', awaView)
      label.innerHTML = 'AWA:'
      L.DomUtil.create('b', 'value', awaView)
      const windView = L.DomUtil.create('div', 'wind', overlayView)
      label = L.DomUtil.create('span', 'label', windView)
      label.innerHTML = 'Wind:'
      L.DomUtil.create('b', 'value', windView)
      return overlayView
    }
    instOverlay.addTo(map.value)

    // only show it if instruments enabled
    if (instruments.value) {
      let instView = map.value._container.querySelector('.instruments')
      instView.style.display = 'flex'
    }

    map_track_setup()
  }

  const map_update = () => {
    let index = 0,
      last = null,
      distance = 0,
      distanceView = map.value._container.querySelector('.legend > .top-row > .distance'),
      playerView = map.value._container.querySelector('.legend > .top-row > .player'),
      datetimeView = map.value._container.querySelector('.legend > .bottom-row > .datetime'),
      tripView = map.value._container.querySelector('.overlay > .top-row > .trip'),
      noteView = map.value._container.querySelector('.overlay > .bottom-row > .note'),
      speedView = map.value._container.querySelector('.instruments > .speed > .value'),
      awaView = map.value._container.querySelector('.instruments > .awa > .value'),
      windView = map.value._container.querySelector('.instruments > .wind > .value')

    playerView.innerHTML = '<i class="va-icon material-icons">play_arrow</i>'
    const geojson = timelapse.value,
      //km = !GlobalStore.imperialUnits,
      interval = setInterval(function () {
        if (play_pause.value === false) {
          return
        }

        var properties = geojson.features[index].properties

        // Display trip data
        if (properties.trip && properties.trip?.name.length != 0 && moorage_overlay.value) {
          tripView.innerText = properties.trip.name
          tripView.style.opacity = 1
          tripView.style.display = 'block'
        } else {
          tripView.style.opacity -= 0.0125 // slower fade-out
          if (tripView.style.opacity < 0.5) {
            tripView.style.display = 'none'
          }
        }
        // Display overlay notes
        if (properties.notes.length != 0 && moorage_overlay.value) {
          noteView.innerText = properties.notes
          noteView.style.opacity = 1
          noteView.style.display = 'block'
        } else {
          noteView.style.opacity -= 0.025 // faster fade-out
          if (noteView.style.opacity < 0.5) {
            noteView.style.display = 'none'
          }
        }

        // Display instruments: SOG/COG
        if (properties.speedoverground && instruments.value) {
          speedView.innerText =
            speedFormatKnots(properties.speedoverground) +
            (properties.courseovergroundtrue ? ' / ' + angleFormat(properties.courseovergroundtrue) : '')
          speedView.parentElement.style.display = 'block'
        } else {
          speedView.parentElement.style.display = 'none'
        }

        // Display instruments: AWA
        if (properties.truewinddirection && properties.courseovergroundtrue && instruments.value) {
          awaView.innerText = awaFormat(properties.truewinddirection, properties.courseovergroundtrue)
          awaView.parentElement.style.display = 'block'
        } else {
          awaView.parentElement.style.display = 'none'
        }

        // Display instruments: SOG/COG
        if (properties.windspeedapparent && instruments.value) {
          windView.innerText =
            speedFormatKnots(properties.windspeedapparent) +
            (properties.truewinddirection ? ' / ' + angleFormat(properties.truewinddirection) : '')
          windView.parentElement.style.display = 'block'
        } else {
          windView.parentElement.style.display = 'none'
        }

        // Get the next coordinates from the geojson
        let coord_rev = geojson.features[index].geometry.coordinates.toReversed()

        // Add the next point to the polyLine
        polyLine.value.addLatLng(coord_rev)

        // Move the maker to a next point
        if (dotMarker.value) {
          dotMarker.value.setLatLngs([coord_rev, coord_rev])
        } else {
          // if boatMarker, remove old one and place new one
          if (boatMarker.value) {
            map.value.removeLayer(boatMarker.value)
          }
          switch (boat_type.value) {
            case 'Sailboat':
              boatMarker.value = sailBoatIcon(geojson.features[index], coord_rev).addTo(map.value)
              break
            case 'SailboatSails':
              boatMarker.value = sailBoatSailsIcon(geojson.features[index], coord_rev).addTo(map.value)
              break
            case 'Powerboat':
              boatMarker.value = powerBoatIcon(geojson.features[index], coord_rev).addTo(map.value)
              break
          }
        }
        // Move map view to the next point
        map.value.panTo(coord_rev, { animate: true })

        // Update the distance display
        if (last) {
          // Returns the distance (in meters)
          distance += last.distanceTo(coord_rev)
          // convert meters -> KM -> NM
          distanceView.innerText = distanceFormat(parseFloat(parseFloat(distance / 1000) * 0.5399568)) + ' NM'
          datetimeView.innerText = dateFormatUTC(properties.time)
        }
        last = L.latLng(coord_rev)
        // if last entry, cancel internal, show replay
        if (index === geojson.features.length - 1) {
          clearInterval(interval)
          last = null
          distance = 0
          play_pause.value = true
          stopped.value = true
          playerView.innerHTML = '<i class="va-icon material-icons">replay</i>'
        }
        index++
      }, speed.value)
  }

  function playAndPause(e) {
    console.log('playAndPause', e, play_pause.value)
    let playerView = map.value._container.querySelector('.legend > .top-row > .player')
    if (stopped.value === true) {
      // replay button clicked
      map_track_replay()
      playerView.innerHTML = '<i class="va-icon material-icons">pause</i>'
    } else if (play_pause.value === true) {
      play_pause.value = false
      playerView.innerHTML = '<i class="va-icon material-icons">pause</i>'
    } else {
      play_pause.value = true
      playerView.innerHTML = '<i class="va-icon material-icons">play_arrow</i>'
    }
  }

  // adapted src: https://stackoverflow.com/a/60391674
  const patchLMapPositions = () =>
    L.Map.include({
      _initControlPos: function () {
        var corners = (this._controlCorners = {}),
          l = 'leaflet-',
          container = (this._controlContainer = L.DomUtil.create('div', l + 'control-container', this._container))

        function createCorner(vSide, hSide) {
          var className = l + vSide + ' ' + l + hSide
          corners[vSide + hSide] = L.DomUtil.create('div', className, container)
        }

        createCorner('top', 'left')
        createCorner('top', 'right')
        createCorner('bottom', 'left')
        createCorner('bottom', 'right')

        createCorner('top', 'center')
        createCorner('middle', 'center')
        createCorner('middle', 'left')
        createCorner('middle', 'right')
        createCorner('bottom', 'center')
      },
    })
</script>

<style lang="scss" scoped>
  .leaflet-map:deep() {
    .legend {
      position: absolute;
      width: 260px;
      height: 70px;
      left: 50%;
      margin-left: -125px;
      padding: 0 0.7rem;
      bottom: 70px;
      background: #000;
      opacity: 0.5;
      color: #fff;
      border-radius: 5px;
      text-align: center;

      .top-row {
        font-size: 24pt;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .bottom-row {
        font-size: 12pt;
      }

      .distance {
        margin-right: 1rem;
      }
      .player {
        cursor: pointer;
        i.material-icons {
          font-size: 24pt;
        }
      }
    }

    .leaflet-center {
      left: 50%;
      transform: translate(-50%, 0%);
    }

    .leaflet-middle {
      top: 50%;
      position: absolute;
      z-index: 1000;
      pointer-events: none;
      transform: translate(0%, -50%);
    }

    .leaflet-center.leaflet-middle {
      transform: translate(-50%, -50%);
    }
    .overlay {
      padding: 0 0.7rem;
      top: 70px;
      background: #000;
      opacity: 0.5;
      color: #fff;
      border-radius: 5px;
      text-align: center;
      .top-row {
        font-size: 18pt;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .bottom-row {
        font-size: 16pt;
      }
    }
    .instruments {
      display: none;
      flex-direction: column;
      align-items: flex-start;
      width: 200px;
      padding: 10px;
      background: #000;
      opacity: 0.5;
      color: #fff;
      border-radius: 5px;
      font-size: 14px;

      .speed,
      .awa,
      .wind {
        display: flex;
        justify-items: stretch;
        width: 100%;
        margin-bottom: 5px;
        display: none;
      }

      .label {
        text-align: right;
        padding: 5px;
        flex: 1;
      }

      .value {
        text-align: left;
        padding: 5px;
        flex: 1;
      }
    }
  }
  #mapContainer {
    height: v-bind(map_height);
  }
</style>
