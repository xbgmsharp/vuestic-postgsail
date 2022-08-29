<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.details.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <div class="mb-3 my-3">
          <template v-if="!isBusy && item">
            <lMap :geo-json-features="mapGeoJsonFeatures" style="width: 100%; height: 250px" />
          </template>
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <dl class="dl-details row mb-3">
              <dt class="flex xs12 md6 pa-2 text--bold">Name</dt>
              <dd class="flex xs12 md6 pa-1">
                <va-input
                  v-model="form.name"
                  placeholder="Name"
                  outline
                  :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                />
              </dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Departed</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.from }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Departed at</dt>
              <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.fromTime) }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Arrived</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.to }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Arrived at</dt>
              <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.toTime) }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Duration</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.duration }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Distance</dt>
              <dd class="flex xs12 md6 pa-2">{{ distanceFormat(item.distance) }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Average / Max Speed</dt>
              <dd class="flex xs12 md6 pa-2">{{ speedFormat(item.avg_speed) }} / {{ speedFormat(item.max_speed) }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Max Wind Speed</dt>
              <dd class="flex xs12 md6 pa-2">{{ speedFormat(item.max_wind_speed) }}</dd>
              <dt class="flex xs12 md6 pa-2 text--bold">Note</dt>
              <dd class="flex xs12 md6 pa-1">
                <va-input v-model="form.notes" outline type="textarea" placeholder="Note" />
              </dd>
            </dl>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script>
  import PostgSail from '../../services/postgsail.js'
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
        apiError: null,
        rowData: null,
        form: {
          isValid: true,
          name: null,
          notes: null,
        },
      }
    },
    computed: {
      item() {
        return this.rowData
          ? {
              id: this.rowData.id,
              name: this.rowData.Name,
              from: this.rowData.From,
              fromTime: this.rowData.Started,
              to: this.rowData.To,
              toTime: this.rowData.Ended,
              distance: this.rowData.Distance,
              duration: this.rowData.Duration,
              notes: this.rowData.Notes,
              geoJson: this.rowData.geojson,
              avg_speed: this.rowData.avg_speed,
              max_speed: this.rowData.max_speed,
              max_wind_speed: this.rowData.max_wind_speed,
            }
          : {}
      },
      mapGeoJsonFeatures() {
        return this.item && this.item.geoJson && this.item.geoJson.features && Array.isArray(this.item.geoJson.features)
          ? this.item.geoJson.features
          : []
      },
      canSubmit() {
        const isDirty = this.item.name !== this.form.name || this.item.notes !== this.form.notes
        return !this.isBusy && this.form.isValid && isDirty
      },
    },
    async mounted() {
      this.isBusy = true
      this.apiError = null
      try {
        const api = new PostgSail()
        const id = this.$route.params.id
        const response = await api.log_get(id)
        if (response.data) {
          this.rowData = response.data
        } else {
          throw { response }
        }
      } catch ({ response }) {
        this.apiError = response.data.message
        console.warn('Get data from json...', this.apiError)
        this.rowData = logsBooks.find((row) => row.id == this.$route.params.id)
      } finally {
        this.isBusy = false
      }
    },
    methods: {},
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
