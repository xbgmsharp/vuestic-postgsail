<template>
  <div id="mapContainer"></div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import 'leaflet-timedimension/dist/leaflet.timedimension.control.min.css'
  import L from 'leaflet'
  import 'leaflet-rotatedmarker'
  import 'leaflet-timedimension'

  /* TODO
   * Update boat icon
   * Listener to draw the linestring as time pass
   * listener not found?
   * Set player at start
   * Add Emodnet bathymetry
   * */
  export default {
    name: 'LeafletMap',
    props: {
      geoJsonFeatures: {
        type: [Array],
        default: null,
      },
    },
    data() {
      return {
        map: null,
      }
    },
    mounted() {
      console.log(`Timelapse`)
      let centerLat = 0
      let centerLng = 0
      let geojson = null

      if (this.geoJsonFeatures && this.geoJsonFeatures.length > 0) {
        const midPoint = Math.round(this.geoJsonFeatures.length / 2)
        //console.log(this.geoJsonFeatures)
        centerLat = this.geoJsonFeatures[midPoint].geometry.coordinates[1]
        centerLng = this.geoJsonFeatures[midPoint].geometry.coordinates[0]
        geojson = this.geoJsonFeatures
      }

      if (centerLat == 0 && centerLng == 0) return
      console.log(`centerLatLng: ${centerLat} ${centerLng}`)

      let start = this.geoJsonFeatures[1].properties.time // First point
      let end = this.geoJsonFeatures[this.geoJsonFeatures.length - 1].properties.time // Last point
      console.log(`StartEnd: ${start} ${end}`)
      // Remove first entry LineString
      //this.geoJsonFeatures.shift(0)
      //console.log(this.geoJsonFeatures[0])

      this.map = L.map('mapContainer', {
        zoom: 12,
        center: [centerLat, centerLng],
        timeDimension: true,
        timeDimensionOptions: {
          timeInterval: `${start}/${end}`,
          period: 'PT2M',
        },
        timeDimensionControl: true,
      })

      const basemaps = {
        OSM: L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }),
        Satellite: L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 17,
          },
        ),
        NOAA: L.tileLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
          attribution: 'NOAA',
          maxZoom: 18,
        }),
        'Emodnet bathymetry': L.tileLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
          attribution:
            'Emodnet bathymetry, &copy; Esri, HERE, DeLorme, MapmyIndia, &copy; OpenStreetMap contributors, and the GIS user community ',
          maxZoom: 18,
        }),
      }
      L.control.layers(basemaps).addTo(this.map)
      basemaps['Satellite'].addTo(this.map)

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

      const geoJSONLayer = L.geoJSON(geojson, {
        pointToLayer: sailBoatIcon,
      })

      const geoJSONTDLayer = L.timeDimension.layer
        .geoJson(geoJSONLayer, {
          updateTimeDimension: true,
          duration: 'PT2M',
          updateTimeDimensionMode: 'replace',
          //addlastPoint: true
        })
        .addTo(this.map)

      const timeDimensionControl = L.control.timeDimension({
        loopButton: true,
        autoPlay: false,
        timeZones: ['Local', 'UTC'],
      })

      this.map.fitBounds(geoJSONLayer.getBounds())
    },
    onBeforeUnmount() {
      if (this.map) {
        this.map.remove()
      }
    },
    methods: {
      timeload(time) {
        console.log(`Even timeload ${time}`)
      },
    },
  }
</script>

<style scoped>
  #mapContainer {
    z-index: 0;
  }
</style>
