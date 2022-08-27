<template>
  <div id="mapContainer"></div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'

  export default {
    name: 'LeafletMap',
    props: {
      markers: {
        type: Array,
        default: () => [],
      },
      path: {
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
      var canvasRenderer = L.canvas({ pane: 'customPane' })
      customPane.style.zIndex = 399 // put just behind the standard overlay pane which is at 400
      const markers = this.markers.map(([lat, lng]) => L.latLng(lat, lng))
      markers.forEach((m) => {
        L.marker(m).addTo(this.map)
      })
      if (this.path.length) {
        const path = this.path.map(([lat, lng]) => L.latLng(lat, lng))
        L.polyline(path, { color: 'red' }).addTo(this.map)
      }
      const bounds = L.latLngBounds(markers)
      this.map.fitBounds(bounds, { padding: [40, 40] })
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
    width: 100vw;
    height: 100vh;
  }
</style>
