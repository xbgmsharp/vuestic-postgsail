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
  import PostgSail from '../../services/api-client'
  import mooragesGeoJSON from '../../data/moorages_map.json'

  const isBusy = ref(false),
    apiError = ref(null),
    mapContainer = ref(),
    map = ref(),
    moorages_map = ref(),
    logs_map = ref()

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.moorages_map()
      if (response && response.geojson?.features) {
        moorages_map.value = response.geojson
        map_setup()
      } else {
        console.error('error moorages map')
        apiError.value = 'error moorages map'
        throw { response }
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
    const geojson = moorages_map.value,
      coord = geojson.features[0].geometry.coordinates
    map.value = L.map(mapContainer.value).setView(coord, 8)

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
    baseMaps['OpenStreetMap'].addTo(map.value)

    let multiplier = Math.max(map.value.getZoom(), 1)
    multiplier = Math.min(map.value.getZoom(), 9)
    console.log('multiplier', multiplier)
    const anchorIcon = function (feature, latlng) {
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
        console.log('popup onEachMoorageFeaturePopup')
        let text = `<div class='center'><h5><a href="/moorage/${feature.properties.id}">${feature.properties.name}</a></h5><br/>
        <a href="/stay/${feature.properties.id}">${feature.properties.total_stay}<a/> day(s) stay<br/></div>`
        // Should be done using i18n
        popupContent = text
      }
      layer.bindPopup(popupContent)
      //bind click
      layer.on({
        click: whenClicked,
      })
    }

    const layer = L.geoJSON(geojson, {
      pointToLayer: anchorIcon,
      onEachFeature: onEachMoorageFeaturePopup,
    }).addTo(map.value)

    map.value.fitBounds(layer.getBounds(), { maxZoom: 17 })
  }

  // TODO Zoom and fit on click
  // TODO convert _from_time to date
  // TODO convert _duration to hours
  const onEachLineStringFeaturePopup = function (feature, layer) {
    var popupContent = '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
    if (feature.properties && feature.properties.id) {
      console.log('popup onEachLineStringFeaturePopup')
      let text = `<div class='center'><h6><a href="/log/${feature.properties.id}">${feature.properties.name}</a></h6><br/>
        ${feature.properties._from_time}, ${feature.properties.distance} miles, ${feature.properties.duration} hours<br/></div>`
      // TODO should be done using i18n
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
    if (logs_map.value) {
      map.value.removeLayer(logs_map.value)
    }
    const layer = e.target
    logs_map.value = await log_from_moorage_geojson(layer.feature.properties.id)
    console.log(logs_map.value)
    L.geoJSON(logs_map.value, { style: GetStyle, onEachFeature: onEachLineStringFeaturePopup }).addTo(map.value)
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
