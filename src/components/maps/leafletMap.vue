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

      if (centerLat == 0 && centerLng == 0) return

      console.log(`centerLatLng: ${centerLat} ${centerLng}`)
      this.map = L.map('mapContainer').setView([centerLat, centerLng], 10)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(this.map)

      const pointToLayer = function (feature, latlng) {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconSize: [15, 30],
            iconAnchor: [7.5, 10],
            iconUrl: '/sailboaticon.png',
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
        pointToLayer: pointToLayer,
        onEachFeature: popup,
      }).addTo(this.map)

      this.map.fitBounds(layer.getBounds())
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
