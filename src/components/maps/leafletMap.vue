<template>
  <div id="mapContainer"></div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'
  import 'leaflet-rotatedmarker'

  export default {
    name: 'LeafletMap',
    props: {
      geoJsonFeatures: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        map: null,
      }
    },
    mounted() {
      this.map = L.map('mapContainer').setView([46.05, 11.05], 5)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map)
      //use a mix of renderers
      var customPane = this.map.createPane('customPane')
      L.canvas({ pane: 'customPane' })
      customPane.style.zIndex = 399
      // geoJson features
      const bounds = []
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
      this.geoJsonFeatures.forEach((f) => {
        const feat = L.geoJSON(f, { pointToLayer }).addTo(this.map)
        bounds.push(feat.getBounds())
      })
      if (bounds.length) {
        this.map.fitBounds(bounds, { padding: [25, 25] })
      }
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
