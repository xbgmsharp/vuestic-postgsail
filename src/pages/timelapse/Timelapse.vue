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

  import { ref, onMounted, computed } from 'vue'
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

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail(),
      payload = {
        _id: route.params.id,
      }
    try {
      const response = await api.log_export_geojson_point_fn(payload)
      if (response.geojson?.features) {
        timelapse.value = response.geojson
        patchLMapPositions()
        map_setup()
      } else {
        console.error('error log_export_geojson_point_fn')
        apiError.value = 'error log_export_geojson_point_fn'
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
    map.value = L.map(mapContainer.value).setView(coord_rev, 13)
    const layer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      },
    ).addTo(map.value)

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
    }, 1000)
  }

  const map_update = () => {
    let index = 1,
      last,
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
          distanceView.innerText = // 1609.34? if non-nautical miles
            (distance += last.distanceTo(coord_rev) / (km ? 1000 : 1852)).toFixed(3)
        }
        last = L.latLng(coord_rev)
        if (index == geojson.features.length - 1) clearInterval(interval)
        index++
      }, 200)
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
