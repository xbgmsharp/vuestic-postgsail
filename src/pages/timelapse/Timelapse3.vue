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
  import 'leaflet.fullscreen'

  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'

  //import { useGlobalStore } from '../../stores/global-store'
  //import timelapseGeoJSON from '../../data/timelapse3.json'
  //import { useI18n } from 'vue-i18n'
  //import { distanceLatLng } from '../../utils/distanceFormatter.js'
  //import noDataScreen from '../../components/noDataScreen.vue'

  const route = useRoute(),
    //{ t } = useI18n(),
    //GlobalStore = useGlobalStore(),
    isBusy = ref(false),
    apiError = ref(null),
    mapContainer = ref(),
    map = ref(),
    polyLine = ref(),
    marker = ref(),
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
    map_type = ref(route.query.map_type || 1),
    speed = ref(route.query.speed || 250),
    delay = ref(route.query.delay || 0),
    zoom = ref(route.query.zoom || 13),
    color = ref(route.query.color || 'dodgerblue'),
    mapHeight = ref(route.query.height || '80vh'),
    ignore_moorage_overlay = ref(route.query.ignore_moorage_overlay || false)

  console.debug(
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
    mapHeight.value,
    ignore_moorage_overlay.value,
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
          const cartodbAttribution =
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: cartodbAttribution,
          }).addTo(map.value)
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
      coord_rev = geojson.features[0].geometry.coordinates.reverse()
    map.value.setView(coord_rev, zoom.value)

    console.log('map_track_setup', coord_rev)

    // Create the line
    polyLine.value = L.polyline([coord_rev], {
      weight: 3,
      color: color.value,
      opacity: 0.9,
    }).addTo(map.value)
    // Create the marker
    marker.value = L.polyline([coord_rev, coord_rev], {
      weight: 8,
      color: 'red',
    }).addTo(map.value)
    // Update map every x ms
    setTimeout(() => {
      map_update()
    }, 1000 + delay.value * 1000) //ms
  }

  const map_track_replay = () => {
    map.value.removeLayer(polyLine.value)
    map.value.removeLayer(marker.value)
    map_track_setup()
  }

  const map_setup = () => {
    const geojson = timelapse.value

    map.value = L.map(mapContainer.value)

    // The geoJSon only contains Geometry Point
    if (geojson.features[0].geometry.type != 'Point') return

    // OSM
    const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    })
    //.addTo(this.map)
    // OpenSeaMap
    const openseamap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
      maxZoom: 18,
    })
    //.addTo(this.map)
    // Satellite
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 17,
      },
    )
    //.addTo(this.map)
    // NOAA
    const noaa = L.tileLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
      attribution: 'NOAA',
      maxZoom: 18,
    })
    //.addTo(this.map)
    // https://emodnet.ec.europa.eu
    const bathymetryLayer = L.tileLayer.wms('http://ows.emodnet-bathymetry.eu/wms', {
      layers: 'emodnet:mean_atlas_land',
      format: 'image/png',
      transparent: true,
      attribution: 'EMODnet Bathymetry',
      opacity: 0.8,
    })
    const coastlinesLayer = L.tileLayer.wms('http://ows.emodnet-bathymetry.eu/wms', {
      layers: 'coastlines',
      format: 'image/png',
      transparent: true,
      attribution: 'EMODnet Bathymetry',
      opacity: 0.8,
    })
    const bathymetryGroupLayer = L.layerGroup([bathymetryLayer, coastlinesLayer])
    //bathymetryGroupLayer.addTo(map)

    const baseMaps = {
      OpenStreetMap: osm,
      Satellite: sat,
      NOAA: noaa,
      'EMODnet Bathymetry': bathymetryGroupLayer,
    }
    const overlays = {
      OpenSeaMap: openseamap,
    }
    L.control.layers(baseMaps, overlays).addTo(map.value)
    baseMaps[Object.keys(baseMaps)[map_type.value]].addTo(map.value)

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
      const moorageView = L.DomUtil.create('div', 'overlay')
      L.DomUtil.create('span', 'note', moorageView)
      return moorageView
    }
    overlay.addTo(map.value)

    map_track_setup()
  }

  const map_update = () => {
    let index = 1,
      last = null,
      distance = 0,
      distanceView = map.value._container.querySelector('.legend > .top-row > .distance'),
      playerView = map.value._container.querySelector('.legend > .top-row > .player'),
      datetimeView = map.value._container.querySelector('.legend > .bottom-row > .datetime'),
      noteView = map.value._container.querySelector('.overlay > .note')

    console.log('map_update', index)

    playerView.innerHTML = '<i class="va-icon material-icons">play_arrow</i>'
    const geojson = timelapse.value,
      //km = !GlobalStore.imperialUnits,
      interval = setInterval(function () {
        if (play_pause.value === false) {
          return
        }
        // Display overlay notes
        //console.debug(geojson.features[index])
        if (geojson.features[index].properties.notes.length != 0 && !ignore_moorage_overlay.value) {
          noteView.innerText = geojson.features[index].properties.notes
          noteView.style.opacity = 1
          noteView.style.display = 'block'
        } else {
          noteView.style.opacity -= 0.025
          if (noteView.style.opacity < 0.5) {
            noteView.style.display = 'none'
          }
        }
        // Get the next coordinates from the geojson
        let coord_rev = geojson.features[index].geometry.coordinates.reverse()
        // Add the next point to the polyLine
        polyLine.value.addLatLng(coord_rev)
        // Move the maker to a next point
        marker.value.setLatLngs([coord_rev, coord_rev])
        // Move map view to the next point
        map.value.panTo(coord_rev, { animate: true })
        // Update the distance display
        if (last) {
          // Returns the distance (in meters)
          distance += last.distanceTo(coord_rev)
          // convert meters -> KM -> NM
          distanceView.innerText = parseFloat(parseFloat(distance / 1000) * 0.5399568).toFixed(3) + ' NM'
          //distanceView.innerText = distanceLatLng((distance += last.distanceTo(coord_rev)))
          datetimeView.innerText = dateFormatUTC(geojson.features[index].properties.time)
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
        margin-bottom: 0.1rem;
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
      color: #ddd;
      text-align: center;
      font-size: 18pt;
      .note {
      }
    }
  }
  #mapContainer {
    height: v-bind(mapHeight);
  }
</style>
