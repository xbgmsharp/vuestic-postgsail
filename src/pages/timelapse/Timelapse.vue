<template>
  <div class="leaflet-maps-page">
    <div class="row">
      <div class="flex md12 xs12">
        <va-card class="leaflet-maps-page__widget" title="Leaflet Maps">
          <div ref="mapContainer" style="height: 75vh" />
        </va-card>
      </div>
    </div>
  </div>
</template>

<script setup>
  import 'leaflet/dist/leaflet.css'
  import * as L from 'leaflet'

  import { ref, onMounted, computed } from 'vue'
  import PostgSail from '../../services/postgsail.js'
  import geojsonDatas from '../../data/geojson.json'

  const isBusy = ref(false)
  const apiError = ref(null)
  const mapContainer = ref()
  const map = ref()
  const polyLine = ref()
  const marker = ref()
  const mygeo = ref()

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const payload = {
      _id: 1,
    }
    try {
      const response = await api.log_export_geojson_point_fn(payload)
      if (response.data.geojson) {
        mygeo.value = response.data.geojson
        map_setup()
      } else {
        console.error('error log_export_geojson_point_fn')
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Get sample data from local json...', apiError.value)
        mygeo.value = geojsonDatas
        map_setup()
      }
    } finally {
      isBusy.value = false
    }
  })

  const map_setup = () => {
    let geojson = mygeo.value
    console.log(geojson.features[0].geometry.coordinates)
    let coord_rev = geojson.features[0].geometry.coordinates.reverse()
    map.value = L.map(mapContainer.value).setView(coord_rev, 13)

    const layer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      },
    ).addTo(map.value)

    const legend = L.control({ position: 'bottomleft' })
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'legend')
      div.innerHTML = '<span>miles</span>'
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
    let geojson = mygeo.value
    let index = 1
    var timelapse = setInterval(function () {
      console.log('map_update')
      let coord_rev = geojson.features[index].geometry.coordinates.reverse()
      polyLine.value.addLatLng(coord_rev)
      marker.value.setLatLngs([coord_rev, coord_rev])
      map.value.panTo(coord_rev, { animate: true })
      // TODO Distance
      if (index == geojson.features.length - 1) {
        clearInterval(timelapse)
      }
      index++
    }, 200)
  }
</script>

<style scoped>
  .legend {
    /*position: absolute;
      z-index: 99;*/
    width: 250px;
    height: 50px;
    left: 50%;
    /*bottom: 75px;
      margin-left: -125px;*/
    background: #000;
    opacity: 0.5;
    color: #fff;
    border-radius: 5px;
    text-align: center;
    font-size: 24pt;
  }
</style>
