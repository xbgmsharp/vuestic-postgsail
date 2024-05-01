<template>
  <div id="mapContainer"></div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'
  import 'leaflet-rotatedmarker'

  import { defaultBaseMapType, baseMaps, overlayMaps, boatMarkerTypes } from './leafletHelpers.js'

  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { awaFormat, angleFormat } from '../../utils/angleFormatter.js'

  import { useGlobalStore } from '../../stores/global-store'
  const { publicVessel } = useGlobalStore()
  /*
   * TODO
   * Add motorboat icon
   */
  export default {
    name: 'LeafletMap',
    props: {
      geoJsonFeatures: {
        type: [Array, Object],
        default: null,
      },
      geoJsonFeature: {
        type: Object,
        default: null,
      },
      mapZoom: {
        type: Number,
        default: 17,
      },
      controlLayer: {
        type: Boolean,
        default: true,
      },
      mapType: {
        type: String,
        default: defaultBaseMapType(),
      },
      geoFilter: {
        /* use to filter the geojson geometry type */
        type: Boolean,
        default: false,
      },
      multigeojson: {
        /* use to handle an array of geojson*/
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        map: null,
      }
    },
    mounted() {
      console.debug('Props mapType:', this.mapType, ' mapZoom:', this.mapZoom)
      let centerLat = 0
      let centerLng = 0
      let geojson = null
      if (this.geoJsonFeature && this.geoJsonFeature.geometry) {
        centerLat = this.geoJsonFeature.geometry.coordinates[1]
        centerLng = this.geoJsonFeature.geometry.coordinates[0]
        geojson = this.geoJsonFeature
      }

      if (this.geoJsonFeatures && this.geoJsonFeatures.length > 0) {
        const midPoint = Math.round(this.geoJsonFeatures.length / 2)
        console.log(`${this.geoJsonFeatures.length} ${midPoint}`)
        console.log(this.geoJsonFeatures)
        if (this.multigeojson) {
          centerLat = parseFloat(this.geoJsonFeatures[midPoint].track_geojson.features[0].geometry.coordinates[1])
          centerLng = parseFloat(this.geoJsonFeatures[midPoint].track_geojson.features[0].geometry.coordinates[0])
        } else {
          centerLat = this.geoJsonFeatures[midPoint].geometry.coordinates[1]
          centerLng = this.geoJsonFeatures[midPoint].geometry.coordinates[0]
        }
        geojson = this.geoJsonFeatures
      }
      console.debug(`LeafletMap`, geojson)
      if (centerLat == 0 && centerLng == 0) return

      console.debug(`LeafletMap centerLatLng: ${centerLat} ${centerLng}`)
      this.map = L.map('mapContainer', {
        zoomControl: this.controlLayer,
      }).setView([centerLat, centerLng], this.mapZoom)

      const bMaps = baseMaps()
      const oMaps = overlayMaps()
      bMaps[this.mapType].addTo(this.map)

      if (this.controlLayer) {
        L.control.layers(bMaps, oMaps).addTo(this.map)
      }

      const popup = function (feature, layer) {
        /* Boat popup
                  Boat Name
          Time	13 minutes ago
          Boat Speed	0 knots
          Wind Speed	4 knots
          Latitude	41.3869066667
          Longitude	2.19916333333
          */
        /* Track popup
                  Boat Name
            Time	8/8/2022, 11:11:30 AM
            Boat Speed	4.2 knots
            Latitude	39.5302133333
            Longitude	2.34970166667
          */
        var popupContent =
          '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
        // If geo point click
        if (feature.properties && feature.properties.time) {
          //console.log(`popup`, feature.properties)
          let status = feature.properties.status || ''
          let time = dateFormatUTC(feature.properties.time)
          let speed = speedFormatKnots(feature.properties.speedoverground) || 0
          let cog = angleFormat(feature.properties.courseovergroundtrue) || 0
          let awa = awaFormat(feature.properties.truewinddirection, feature.properties.courseovergroundtrue) || 0
          let wind = speedFormatKnots(feature.properties.windspeedapparent) || 0
          let winddir = angleFormat(feature.properties.truewinddirection) || 0
          let latitude = parseFloat(feature.properties.latitude).toFixed(5)
          let longitude = parseFloat(feature.properties.longitude).toFixed(5)
          let text = `<div class='center'><h4>${publicVessel}: ${status}</h4></div><br/>
              Time: ${time}<br/>
              Boat Speed: ${speed}<br/>
              Course Over Ground: ${cog}<br/>
              Apparent Wind Angle: ${awa}<br/>
              Wind Speed: ${wind}<br/>
              Wind Direction: ${winddir}<br/>
              Latitude: ${latitude}<br/>
              Longitude: ${longitude}<br/>`
          popupContent = text
        }
        // If geo linestring click
        if (feature.properties && feature.properties._from_time) {
          //console.log(`popup`, feature.properties)
          let time = dateFormatUTC(feature.properties._from_time)
          let avg_speed = speedFormatKnots(feature.properties.avg_speed)
          let duration = durationFormatHours(feature.properties.duration) + ' H'
          let distance = parseFloat(feature.properties.distance).toFixed(5) + ' NM'
          let text = `<div class='center'><h4><a id="logLink" style="cursor: pointer;" onclick="logLink(${feature.properties.id})">${feature.properties.name}</a></h4></div><br/>
              Time: ${time}<br/>
              Average Speed: ${avg_speed}<br/>
              Duration: ${duration}<br/>
              Distance: ${distance}<br/>
              <a id="timelapseLink" style="cursor: pointer;" onclick="timelapseLink(${feature.properties.id})">Play timelapse</a>`
          popupContent = text

          // Go to logbook details page
          window.logLink = async function (log_id) {
            let tripLink = document.getElementById('logLink')
            tripLink.href = `/logmap/${log_id}`
            return
          }
          // Go to timelapse page
          window.timelapseLink = async function (log_id) {
            let link = document.getElementById('timelapseLink')
            link.href = `/timelapse/${log_id}`
            return
          }
        }
        layer.bindPopup(popupContent)
      }
      const geoFilter = this.geoFilter
      const geoMapFilter = function (feature, layer) {
        console.log(geoFilter)
        if (!geoFilter) {
          return true
        }
        if (feature.geometry) {
          // If the geometry is not a LineString, return false (don't render features under construction)
          return feature.geometry.type != 'LineString' ? false : true
        }
        return false
      }

      // TODO: use boat type from actual boat config (sailboat/powerboat)
      const boatIcon = boatMarkerTypes()['Sailboat']

      let layer = null
      if (this.multigeojson) {
        let layers = []
        let featGroup = new L.FeatureGroup()
        let controlLayer = L.control.layers()
        //console.log(geojson.length)
        for (let i = 0; i < geojson.length; i++) {
          //console.log(geojson[i].track_geojson)
          let color = random_rgb_dark()
          layers[i] = L.geoJSON(geojson[i].track_geojson, {
            style: { color: random_rgb_dark() },
            filter: geoMapFilter,
            pointToLayer: boatIcon,
            onEachFeature: popup,
          }).addTo(featGroup)
          featGroup.addTo(this.map)
          const text = `<i class="geojson-box" style="background-color:${color}">&nbsp;</i><h4>${geojson[i].track_geojson.features[0].properties.name}</h4><small>${geojson[i].track_geojson.features[0].properties._from_time}</small>`
          controlLayer.addOverlay(layers[i], text).addTo(this.map)
          //document.getElementsByClassName('leaflet-control-layers-toggle')[1].className = 'leaflet-control-layers-toggle pgsail-geojson'
          document.getElementsByClassName('leaflet-control-layers-toggle')[1].style =
            "background-image: url('/favicon-32x32.png');"
        }
        layer = featGroup
      } else {
        layer = L.geoJSON(geojson, {
          filter: geoMapFilter,
          pointToLayer: boatIcon,
          onEachFeature: popup,
        }).addTo(this.map)
      }
      console.log('LeafletMap props.controlLayer', this.controlLayer, 'props.Zoom:', this.zoom)
      this.map.fitBounds(layer.getBounds(), { maxZoom: 17 })
      //this.map.setZoom(this.zoom)
    },
    onBeforeUnmount() {
      if (this.map) {
        this.map.remove()
      }
    },
  }

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')'
  }
</script>

<style scoped>
  #mapContainer {
    z-index: 0;
  }
  .geojson-box {
    float: left;
    height: 10px;
    width: 10px;
    margin-bottom: 15px;
    border: 1px solid black;
    clear: both;
    padding: 1px 1px;
  }
</style>
