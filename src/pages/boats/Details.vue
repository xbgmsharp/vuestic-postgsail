<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.details.title') }}</va-card-title>
      <va-card-content>
        <va-inner-loading :loading="isBusy">
          <div class="mb-3 my-3">
            <lMap :loading="isBusy" :markers="mapMarkers" style="width: 100%; height: 250px" />
          </div>
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="form.isValid = $event">
              <dl class="dl-details row">
                <dt class="flex xs12 md6 text--bold">{{ $t('boats.boat.name') }}</dt>
                <dd class="flex xs12 md6">{{ item.name }}</dd>
                <dt class="flex xs12 md6 text--bold">{{ $t('boats.boat.mmsi') }}</dt>
                <dd class="flex xs12 md6">{{ item.mmsi }}</dd>
                <dt class="flex xs12 md6 text--bold">{{ $t('boats.boat.last_contact') }}</dt>
                <dd class="flex xs12 md6">{{ dateFormat(item.last_contact) }}</dd>
              </dl>
            </va-form>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script>
  import dateFormater from '../../mixins/dateFormater.js'
  import vesselsDatas from '../../data/vessel.json'
  import lMap from '../../components/maps/leafletMap.vue'
  import { defineComponent } from 'vue'
  export default defineComponent({
    components: {
      lMap,
    },
    mixins: [dateFormater],
    data() {
      return {
        isBusy: false,
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
        return []
      },
    },
    mounted() {
      this.getBoat()
    },
    methods: {
      getBoat() {
        this.isBusy = true
        window.setTimeout(() => {
          const mmsi = this.$route.params.mmsi
          const row = [vesselsDatas].find((row) => row.mmsi == mmsi)
          this.item = { ...row }
          this.form.name = this.item.name
          this.form.notes = this.item.notes
          this.isBusy = false
        }, 400)
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
