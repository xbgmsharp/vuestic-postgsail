<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.details.title') }}</va-card-title>
      <va-card-content>
        <div class="mb-3 my-3">
          <template v-if="!isBusy">
            <lMap :markers="mapMarkers" :path="mapPath" style="width: 100%; height: 250px" />
          </template>
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="form.isValid = $event">
              <dl class="dl-details row">
                <dt class="flex xs12 md6 text--bold">Name</dt>
                <dd class="flex xs12 md6">
                  <va-input
                    v-model="form.name"
                    placeholder="Name"
                    outline
                    :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                  />
                </dd>
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
                <dd class="flex xs12 md6">{{ distanceFormat(item.distance) }}</dd>
                <dt class="flex xs12 md6 text--bold">Average / Max Speed</dt>
                <dd class="flex xs12 md6">{{ speedFormat(item.avg_speed) }} / {{ speedFormat(item.max_speed) }}</dd>
                <dt class="flex xs12 md6 text--bold">Max Wind Speed</dt>
                <dd class="flex xs12 md6">{{ speedFormat(item.max_wind_speed) }}</dd>
                <dt class="flex xs12 md6 text--bold">Note</dt>
                <dd class="flex xs12 md6">
                  <va-input v-model="form.notes" outline type="textarea" placeholder="Note" />
                </dd>
              </dl>
              <div class="row justify--end">
                <div class="flex">
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
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
  import distanceFormater from '../../mixins/distanceFormater.js'
  import speedFormater from '../../mixins/speedFormater.js'
  import logsBooks from '../../data/logbook.json'
  import lMap from '../../components/maps/leafletMap.vue'
  import { defineComponent } from 'vue'
  export default defineComponent({
    components: {
      lMap,
    },
    mixins: [dateFormater, distanceFormater, speedFormater],
    data() {
      return {
        isBusy: true,
        item: null,
        form: {
          isValid: true,
          name: null,
          notes: null,
        },
      }
    },
    computed: {
      mapMarkers() {
        return !this.item
          ? []
          : ['from', 'to']
              .map((key) => {
                const lat = this.item['_' + key + '_lat']
                const lng = this.item['_' + key + '_lng']
                return lat && lng ? [lat, lng] : null
              })
              .filter(Boolean)
      },
      mapPath() {
        if (!this.item || !this.item.track_geom || !this.item.track_geom.length) {
          return []
        }
        const re = new RegExp(/\((.*)\)/, 'g')
        const pointsString = this.item.track_geom.match(re)[0]
        const points = pointsString.substring(1, pointsString.length - 1).split(', ')
        return points
          .map((str) => {
            const [lat, lng] = str.split(' ').map(Number)
            return lat && lng ? [lat, lng] : null
          })
          .filter(Boolean)
      },
      canSubmit() {
        const isDirty = this.item.name !== this.form.name || this.item.notes !== this.form.notes
        return !this.isBusy && this.form.isValid && isDirty
      },
    },
    mounted() {
      this.getLog()
    },
    methods: {
      getLog() {
        this.isBusy = true
        window.setTimeout(() => {
          const id = this.$route.params.id
          const row = logsBooks.find((row) => row.id == id)
          this.item = { ...row }
          this.form.name = this.item.name
          this.form.notes = this.item.notes
          this.isBusy = false
        }, 400)
      },
      handleSubmit() {
        console.log('Submiting Log...')
        this.$refs.form.validate()
        if (this.form.isValid) {
          this.isBusy = true
          window.setTimeout(() => {
            this.isBusy = false
          }, 400)
          console.log('Send datas', this.form)
        }
      },
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
