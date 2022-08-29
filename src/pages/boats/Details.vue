<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.details.title') }}</va-card-title>
      <va-card-content>
        <va-inner-loading :loading="isBusy">
          <div class="mb-3 my-3">
            <template v-if="!isBusy && item">
              <lMap :loading="isBusy" style="width: 100%; height: 250px" />
            </template>
          </div>
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="form.isValid = $event">
              <dl class="dl-details row">
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.name') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.name }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.mmsi') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.mmsi }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.last_contact') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.lastContact) }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('boats.boat.created_at') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ dateFormat(item.createdAt) }}</dd>
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
        rowData: null,
      }
    },
    computed: {
      item() {
        return this.rowData
          ? {
              name: this.rowData.name,
              mmsi: this.rowData.mmsi,
              lastContact: this.rowData.last_contact,
              createdAt: this.rowData.created_at,
            }
          : {}
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
          const row = [...vesselsDatas].find((row) => row.mmsi == mmsi)
          this.rowData = { ...row }
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
