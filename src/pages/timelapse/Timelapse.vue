<template>
  <div class="leaflet-maps-page">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-card class="leaflet-maps-page__widget" title="Leaflet Maps">
      <div ref="mapContainer" style="height: 80vh" class="leaflet-map h-full" />
    </va-card>
  </div>
</template>

<script setup>
  import 'leaflet/dist/leaflet.css'
  import * as L from 'leaflet'

  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/api-client'
  import { useGlobalStore } from '../../stores/global-store'
  import timelapseGeoJSON from '../../data/timelapse.json'

  const route = useRoute(),
    GlobalStore = useGlobalStore(),
    isBusy = ref(false),
    apiError = ref(null),
    mapContainer = ref(),
    map = ref(),
    polyLine = ref(),
    marker = ref(),
    timelapse = ref()

  // Query-string
  // ?start_log=7953&end_log=7953&start_date=None&end_date=None&map_type=1&speed=250&delay=1&zoom=13
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
    zoom = ref(route.query.zoom || 13)

  console.debug(
    'QS',
    start_log.value,
    end_log.value,
    start_date.value,
    end_date.value,
    map_type.value,
    speed.value,
    delay.value,
    zoom.value,
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
      const response = await api.timelapse(payload)
      if (response && response.geojson?.features) {
        timelapse.value = response.geojson
        patchLMapPositions()
        map_setup()
      } else {
        console.error('error timelapse')
        apiError.value = 'error timelapse'
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Get sample data from local json...', apiError.value)
        timelapse.value = timelapseGeoJSON
        map_setup()
      }
    } finally {
      isBusy.value = false
    }
  })

  const map_setup = () => {
    const geojson = timelapse.value,
      coord_rev = geojson.features[0].geometry.coordinates.reverse()
    map.value = L.map(mapContainer.value).setView(coord_rev, zoom.value)

    // OSM
    const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
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

    const baseMaps = {
      OpenStreetMap: osm,
      Satellite: sat,
      NOAA: noaa,
    }
    const overlays = {}
    L.control.layers(baseMaps, overlays).addTo(map.value)
    baseMaps[Object.keys(baseMaps)[map_type.value]].addTo(map.value)

    const legend = L.control({ position: 'bottomcenter' })
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'legend')
      L.DomUtil.create('span', 'distance', div)
      console.log(
        'map_setup GlobalStore.imperialUnits',
        GlobalStore.imperialUnits,
        GlobalStore.settings.use_imperial_units,
      )
      L.DomUtil.create('span', null, div).innerText = GlobalStore.imperialUnits ? 'miles' : 'kilometres'
      return div
    }
    legend.addTo(map.value)
    polyLine.value = L.polyline([coord_rev], {
      weight: 3,
      color: 'dodgerblue',
      opacity: 0.9,
    }).addTo(map.value)
    marker.value = L.polyline([coord_rev, coord_rev], {
      weight: 8,
      color: 'red',
    }).addTo(map.value)
    setTimeout(() => {
      map_update()
    }, 1000 + delay.value * 1000) //ms
  }

  const map_update = () => {
    let index = 1,
      last = null,
      distance = 0,
      distanceView = map.value._container.querySelector('.legend > .distance')

    const geojson = timelapse.value,
      km = !GlobalStore.imperialUnits,
      interval = setInterval(function () {
        let coord_rev = geojson.features[index].geometry.coordinates.reverse()
        polyLine.value.addLatLng(coord_rev)
        marker.value.setLatLngs([coord_rev, coord_rev])
        map.value.panTo(coord_rev, { animate: true })
        if (last) {
          distanceView.innerText = // default to non-nautical miles
            (distance += last.distanceTo(coord_rev) / (km ? 1000 : 1852)).toFixed(3)
        }
        last = L.latLng(coord_rev)
        if (index == geojson.features.length - 1) clearInterval(interval)
        index++
      }, speed.value)
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
      /*position: absolute;
      width: 250px;
      height: 50px;
      left: 50%;
      margin-left: -125px;*/
      padding: 0 0.7rem;
      bottom: 75px;
      background: #000;
      opacity: 0.5;
      color: #fff;
      border-radius: 5px;
      text-align: center;
      font-size: 24pt;

      .distance {
        margin-right: 1rem;
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
  }
</style>
