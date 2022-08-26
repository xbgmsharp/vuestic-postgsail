<template>
  <GMapMap ref="map" :zoom="zoom" :center="center" :options="mapOptions">
    <GMapMarker v-for="(m, index) in markers" :key="index" :position="m.position" />
    <GMapPolyline ref="polyline" :path="path" />
  </GMapMap>
</template>

<script>
  import { defineComponent } from 'vue'
  export default defineComponent({
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
      center: {
        type: Object,
        default: () => ({ lat: 0, lng: 0 }),
      },
      zoom: {
        type: Number,
        default: 4,
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
        defaultOptions: {
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        },
      }
    },
    computed: {
      mapOptions() {
        return {
          ...this.defaultOptions,
          ...this.options,
        }
      },
    },
    watch: {
      markers: {
        handler: function (val) {
          if (val && Array.isArray(val) && val.length) {
            const bounds = new window.google.maps.LatLngBounds()
            val.forEach((marker) => {
              bounds.extend(marker.position)
            })
            this.$refs.map.fitBounds(bounds)
          }
        },
        immediate: true,
      },
    },
  })
</script>

<style lang="scss" scoped></style>
