<template>
  <div>
    <l-map ref="leafmap" :zoom="mapZoom" :center="mapCenter" :bounds="mapBounds" style="height: 100%; width: 100%">
      <l-tile-layer :url="url" :attribution="attribution" />
      <template v-for="(pos, index) in mapMarkers" :key="index">
        <l-marker :lat-lng="pos" />
      </template>
      <l-polyline :lat-lngs="mapPath" color="red"></l-polyline>
    </l-map>
  </div>
</template>

<script>
  import { latLng, latLngBounds } from 'leaflet'
  import { LMap, LTileLayer, LMarker, LPolyline } from '@vue-leaflet/vue-leaflet'
  import 'leaflet/dist/leaflet.css'
  import { defineComponent } from 'vue'
  export default defineComponent({
    components: {
      LMap,
      LTileLayer,
      LMarker,
      LPolyline,
    },
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
      center: {
        type: Object,
        default: null,
      },
      zoom: {
        type: Number,
        default: 6,
      },
      options: {
        type: Object,
        default: () => ({}),
      },
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
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        defaultOptions: {
          zoomSnap: 0.5,
        },
      }
    },
    computed: {
      mapCenter() {
        const [lat, lng] = this.center ? this.center : this.markers.length ? this.markers[0] : [0, 0]
        return this.mapBounds ? this.mapBounds.getCenter() : lat && lng ? latLng(lat, lng) : latLng(0, 0)
      },
      mapZoom() {
        return !this.mapBounds ? this.zoom : undefined
      },
      mapMarkers() {
        return this.markers.map(([lat, lng]) => (lat && lng ? latLng(lat, lng) : null)).filter(Boolean)
      },
      mapPath() {
        return this.path.map(([lat, lng]) => (lat && lng ? latLng(lat, lng) : null)).filter(Boolean)
      },
      mapBounds() {
        const bounds = latLngBounds()
        this.mapMarkers.forEach((position) => {
          bounds.extend(position)
        })
        return this.mapMarkers.length && bounds.isValid() ? bounds : null
      },
      mapOptions() {
        return {
          ...this.defaultOptions,
          ...this.options,
        }
      },
    },
  })
</script>

<style lang="scss" scoped></style>
