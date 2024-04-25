<template>
  <div id="mapContainer"></div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'
  import 'leaflet-rotatedmarker'

  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { speedFormat } from '../../utils/speedFormatter.js'
  import { sailConfigImage, awaFormat, angleFormat } from '../../utils/angleFormatter.js'

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
      zoom: {
        /*default zoom Level */
        type: Number,
        default: 17,
      },
      controlLayer: {
        /* Enable / Disable zoom Control */
        type: Boolean,
        default: true,
      },
      mapType: {
        /* set the default tile Layer */
        type: String,
        default: 'OpenStreetMap',
      },
      geoFilter: {
        /* use to filter the geojson geometry type */
        type: Boolean,
        default: false,
      },
      openseamapLayer: {
        /* use to display OpenSeaMap layer */
        type: Boolean,
        default: true,
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
      console.debug('Props maptype:', this.maptype, ' openseamapLayer', this.openseamapLayer, ' Zoom:', this.zoom)
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
      }).setView([centerLat, centerLng], this.zoom)

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
      var bathymetryLayer = L.tileLayer.wms('http://ows.emodnet-bathymetry.eu/wms', {
        layers: 'emodnet:mean_atlas_land',
        format: 'image/png',
        transparent: true,
        attribution: 'EMODnet Bathymetry',
        opacity: 0.8,
      })
      var coastlinesLayer = L.tileLayer.wms('http://ows.emodnet-bathymetry.eu/wms', {
        layers: 'coastlines',
        format: 'image/png',
        transparent: true,
        attribution: 'EMODnet Bathymetry',
        opacity: 0.8,
      })
      var bathymetryGroupLayer = L.layerGroup([bathymetryLayer, coastlinesLayer])
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
      if (this.controlLayer) {
        L.control.layers(baseMaps, overlays).addTo(this.map)
      }
      //baseMaps['OpenStreetMap'].addTo(this.map)
      baseMaps[this.mapType].addTo(this.map)
      if (this.openseamapLayer) {
        openseamap.addTo(this.map)
      }

      const sailBoatIconImg = function (feature) {
        if (
          feature.properties.status == 'sailing' &&
          feature.properties.truewinddirection &&
          feature.properties.courseovergroundtrue
        ) {
          return sailConfigImage(feature.properties.truewinddirection, feature.properties.courseovergroundtrue)
        }
        return '/sailboat.png'
      }

      const sailBoatIcon = function (feature, latlng) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            iconUrl: sailBoatIconImg(feature),
          }),
          rotationAngle: feature.properties.courseovergroundtrue,
        })
      }
      const powerBoatIcon = function (feature, latlng) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [15, 30],
            iconAnchor: [7.5, 10],
            iconUrl: '/powerboaticon.png',
          }),
          rotationAngle: feature.properties.courseovergroundtrue,
        })
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
          let speed = speedFormat(feature.properties.speedoverground) || 0
          let cog = angleFormat(feature.properties.courseovergroundtrue) || 0
          let awa = awaFormat(feature.properties.truewinddirection, feature.properties.courseovergroundtrue) || 0
          let wind = speedFormat(feature.properties.windspeedapparent) || 0
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
          let avg_speed = speedFormat(feature.properties.avg_speed)
          let duration = durationFormatHours(feature.properties.duration) + ' H'
          let distance = parseFloat(feature.properties.distance).toFixed(5) + ' NM'
          let text = `<div class='center'><h4><a id="logLink" style="cursor: pointer;" onclick="logLink(${feature.properties.id})">${feature.properties.name}</a></h4></div><br/>
              Time: ${time}<br/>
              avg_speed: ${avg_speed}<br/>
              Duration: ${duration}<br/>
              Distance: ${distance}<br/>`
          popupContent = text

          // Save note to GeoJSON properties
          window.logLink = async function (log_id) {
            let tripLink = document.getElementById('logLink')
            tripLink.href = `/logmap/${log_id}`
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

      let layer = null
      if (this.multigeojson) {
        let layers = []
        let featGroup = new L.FeatureGroup()
        const midPoint = Math.round(geojson.length / 2)
        //console.log(geojson.length)
        for (let i = 0; i < geojson.length; i++) {
          //console.log(geojson[i].track_geojson)
          layers[i] = L.geoJSON(geojson[i].track_geojson, {
            style: { color: random_rgb_dark() },
            filter: geoMapFilter,
            pointToLayer: sailBoatIcon,
            onEachFeature: popup,
          }).addTo(featGroup)
          featGroup.addTo(this.map)
        }
        layer = featGroup
      } else {
        layer = L.geoJSON(geojson, {
          filter: geoMapFilter,
          pointToLayer: sailBoatIcon,
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
</style>
