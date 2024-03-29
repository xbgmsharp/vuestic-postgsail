<template>
  <div class="leaflet-maps-page">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
    </template>
    <va-card class="leaflet-maps-page__widget">
      <div ref="mapContainer" style="height: 100%" class="leaflet-map h-full" />
    </va-card>
  </div>
</template>

<script setup>
  /*
   * TODO
   * Add boat name
   * Add motorboat icon
   * Add Emodnet bathymetry
   */
  import 'leaflet/dist/leaflet.css'
  import * as L from 'leaflet'

  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import PostgSail from '../../services/api-client'
  import mooragesGeoJSON from '../../data/moorages_map.json'

  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'

  const isBusy = ref(false),
    apiError = ref(null),
    mapContainer = ref(),
    map = ref(),
    moorages_map = ref(),
    outbound_logs_map = ref(),
    inbound_logs_map = ref()

  const props = defineProps({
    map_zoom: {
      type: Number,
      default: 8,
      required: false,
    },
    moorage_map_id: {
      type: Number,
      default: 0,
      required: false,
    },
  })
  console.log('props map_zoom,moorage_map_id', props.map_zoom, props.moorage_map_id)

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.moorages_export_geojson()
      if (response && response.geojson?.features) {
        moorages_map.value = response.geojson
        map_setup()
      } else {
        console.warn('error moorages_map', response)
        // If empty data, display a world map.
        if (!response.geojson?.features) {
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
    const geojson = moorages_map.value
    let coord = geojson.features[0].geometry.coordinates
    if (props.moorage_map_id != 0) {
      coord = geojson.features.filter((geog) => geog.properties.id == props.moorage_map_id)[0].geometry.coordinates
    }
    map.value = L.map(mapContainer.value).setView(coord, props.map_zoom)
    //console.log(coord)

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
    const markerIcon = function (feature, latlng) {
      if (feature.properties.stay_code == 3) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [multiplier * 4, multiplier * 4],
            iconAnchor: [multiplier * 2, multiplier * 2],
            iconUrl: '/mooring_icon.png',
            popupAnchor: [0, 0],
          }),
        })
      }
      if (feature.properties.stay_code == 4) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [multiplier * 4, multiplier * 4],
            iconAnchor: [multiplier * 2, multiplier * 2],
            iconUrl: '/dock_icon.png',
            popupAnchor: [0, 0],
          }),
        })
      }
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
      pointToLayer: markerIcon,
      onEachFeature: onEachMoorageFeaturePopup,
    }).addTo(map.value)

    map.value.fitBounds(layer.getBounds(), { maxZoom: 17 })
    if (props.moorage_map_id != 0) {
      map.value.flyTo(coord.reverse(), props.map_zoom)
    }
  }

  // TODO Zoom and fit on click
  // TODO convert _from_time to date
  // TODO convert _duration to hours
  const onEachLineStringFeaturePopup = function (feature, layer) {
    var popupContent = '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
    if (feature.properties && feature.properties.id) {
      console.log('popup onEachLineStringFeaturePopup')
      let date = dateFormatUTC(feature.properties._from_time)
      let duration = durationFormatHours(feature.properties.duration)
      let distance = distanceFormat(feature.properties.distance)
      let text = `<div class='center'><h6><a href="/log/${feature.properties.id}">From ${feature.properties.name}</a></h6><br/>
        ${date}, ${distance} miles, ${duration} hours<br/></div>`
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
    if (outbound_logs_map.value) {
      map.value.removeLayer(outbound_logs_map.value)
    }
    if (inbound_logs_map.value) {
      map.value.removeLayer(inbound_logs_map.value)
    }
    const layer = e.target
    outbound_logs_map.value = await log_from_moorage_geojson(layer.feature.properties.id)
    L.geoJSON(outbound_logs_map.value, { style: { color: 'blue' }, onEachFeature: onEachLineStringFeaturePopup }).addTo(
      map.value,
    )
    inbound_logs_map.value = await log_to_moorage_geojson(layer.feature.properties.id)
    L.geoJSON(inbound_logs_map.value, { style: { color: 'red' }, onEachFeature: onEachLineStringFeaturePopup }).addTo(
      map.value,
    )
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

  const log_to_moorage_geojson = async (id) => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const payload = {
      _id: id,
    }
    try {
      const response = await api.find_log_to_moorage_fn(payload)
      if (response && response.geojson?.features) {
        return response.geojson
      } else {
        if (!response.geojson?.features) {
          return // no error if no data
        }
        console.error('error find_log_to_moorage_fn', response)
        apiError.value = 'error find_log_to_moorage_fn'
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      console.warn('Error...', apiError.value)
    } finally {
      isBusy.value = false
    }
  }

  onBeforeUnmount(async () => {
    if (map.value) {
      map.value.remove()
    }
  })
</script>

<style lang="scss" scoped></style>
