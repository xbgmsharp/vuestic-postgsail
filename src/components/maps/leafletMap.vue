<template>
  <div id="mapContainer"></div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'
  import 'leaflet-rotatedmarker'

  /*
   * TODO
   * Add boat name
   * Add motorboat icon
   * Add Emodnet bathymetry
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
        type: Number,
        default: 17,
      },
      controlLayer: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        map: null,
      }
    },
    mounted() {
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
        centerLat = this.geoJsonFeatures[midPoint].geometry.coordinates[1]
        centerLng = this.geoJsonFeatures[midPoint].geometry.coordinates[0]
        geojson = this.geoJsonFeatures
      }
      console.log(`LeafletMap`)
      if (centerLat == 0 && centerLng == 0) return

      console.log(`LeafletMap centerLatLng: ${centerLat} ${centerLng}`)
      this.map = L.map('mapContainer', {
        zoomControl: this.controlLayer,
      }).setView([centerLat, centerLng], this.zoom)

      // OSM
      const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
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

      const baseMaps = {
        OpenStreetMap: osm,
        Satellite: sat,
        NOAA: noaa,
      }
      const overlays = {}
      if (this.controlLayer) {
        L.control.layers(baseMaps, overlays).addTo(this.map)
      }
      baseMaps['OpenStreetMap'].addTo(this.map)

      const sailBoatIcon = function (feature, latlng) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [15, 30],
            iconAnchor: [7.5, 10],
            iconUrl: '/sailboaticon.png',
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
        if (feature.properties && feature.properties.time) {
          console.log(`popup`)
          let text = `<div class='center'><h4>${feature.geometry.type}</h4></div><br/>
              Time: ${feature.properties.time}<br/>
              Boat Speed: ${feature.properties.speedoverground}<br/>
              Latitude: ${feature.properties.latitude}<br/>
              Longitude: ${feature.properties.longitude}<br/>`
          popupContent = text
        }
        layer.bindPopup(popupContent)
      }

      const layer = L.geoJSON(geojson, {
        pointToLayer: sailBoatIcon,
        onEachFeature: popup,
      }).addTo(this.map)
      console.log('LeafletMap props.controlLayer', this.controlLayer, 'props.Zoom:', this.zoom)
      this.map.fitBounds(layer.getBounds(), { maxZoom: 17 })
      this.map.setZoom(this.zoom)
    },
    onBeforeUnmount() {
      if (this.map) {
        this.map.remove()
      }
    },
  }
</script>

<style scoped>
  #mapContainer {
    z-index: 0;
  }
</style>
