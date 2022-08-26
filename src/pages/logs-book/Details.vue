<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.details.title') }}</va-card-title>
      <va-card-content>
        <va-inner-loading :loading="isBusy">
          <div class="mb-3 my-3">
            <GMapMap
              :center="mapCenter"
              :zoom="7"
              :disable-default-u-i="true"
              :options="mapOptions"
              map-type-id="terrain"
              style="width: 100%; height: 250px"
            >
              <template v-if="item && item.name">
                <GMapMarker v-for="(m, index) in mapMarkers" :key="index" :position="m.position" />
                <GMapPolyline ref="polyline" :path="mapPath" />
              </template>
            </GMapMap>
          </div>
          <template v-if="item">
            <va-form ref="form">
              <dl class="dl-details row">
                <dt class="flex xs12 md6 text--bold">Name</dt>
                <dd class="flex xs12 md6"><va-input v-model="item.name" placeholder="Name" /></dd>
                <dt class="flex xs12 md6 text--bold">Boat</dt>
                <dd class="flex xs12 md6">{{ item.client_id }}</dd>
                <dt class="flex xs12 md6 text--bold">Departed</dt>
                <dd class="flex xs12 md6">{{ item._from }}</dd>
                <dt class="flex xs12 md6 text--bold">Departed at</dt>
                <dd class="flex xs12 md6">{{ dateFormat(item._from_time) }}</dd>
                <dt class="flex xs12 md6 text--bold">Arrived</dt>
                <dd class="flex xs12 md6">{{ item._to }}</dd>
                <dt class="flex xs12 md6 text--bold">Arrived at</dt>
                <dd class="flex xs12 md6">{{ dateFormat(item._to_time) }}</dd>
                <dt class="flex xs12 md6 text--bold">Duration</dt>
                <dd class="flex xs12 md6">{{ item.duration }}</dd>
                <dt class="flex xs12 md6 text--bold">Distance</dt>
                <dd class="flex xs12 md6">{{ item.distance }}</dd>
                <dt class="flex xs12 md6 text--bold">Average / Max Speed</dt>
                <dd class="flex xs12 md6">{{ item.avg_speed }} / {{ item.max_speed }}</dd>
                <dt class="flex xs12 md6 text--bold">Max Wind Speed</dt>
                <dd class="flex xs12 md6">{{ item.max_wind_speed }}</dd>
                <dt class="flex xs12 md6 text--bold">Note</dt>
                <dd class="flex xs12 md6">
                  <va-input v-model="item.notes" type="textarea" placeholder="Note" />
                </dd>
              </dl>
              <div class="row justify--end">
                <div class="flex">
                  <va-button @click="$refs.form.validate()"> Save </va-button>
                </div>
              </div>
            </va-form>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script>
  import dateFormater from '../../mixins/dateFormater.js'
  import logsBooks from '../../data/logbook.json'
  import { defineComponent } from 'vue'
  export default defineComponent({
    mixins: [dateFormater],
    data() {
      return {
        isBusy: false,
        item: null,
        mapOptions: {
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
      mapCenter() {
        return this.item ? this.mapMarkers[0].position : { lat: 0, lng: 0 }
      },
      mapMarkers() {
        return ['from', 'to']
          .map((key) => {
            if (!this.item) {
              return null
            }
            const lat = this.item['_' + key + '_lat']
            const lng = this.item['_' + key + '_lng']
            return { position: { lat, lng } }
          })
          .filter(Boolean)
      },
      mapPath() {
        if (!this.item) {
          return null
        }
        const re = new RegExp(/\((.*)\)/, 'g')
        const pointsString = this.item.track_geom.match(re)[0]
        const points = pointsString.substring(1, pointsString.length - 1).split(', ')
        return points.map((str) => {
          const [lat, lng] = str.split(' ').map(Number)
          return { lat, lng }
        })
      },
    },
    mounted() {
      this.isBusy = true
      window.setTimeout(() => {
        this.item = { ...logsBooks[this.$route.params.id] }
        this.isBusy = false
      }, 400)
    },
  })
</script>

<style lang="scss" scoped>
  .dl-details {
    > dt:nth-child(4n + 3) {
      &,
      & + dd {
        background-color: var(--va-background);
      }
    }
  }
</style>
