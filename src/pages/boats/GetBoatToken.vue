<template>
  <div>
    <va-button @click="handleGetToken">
      {{ $t('boats.boat.token_modal.button') }}
    </va-button>
    <va-modal v-model="showModal" no-padding>
      <template #content="{ ok }">
        <va-card-title>
          {{ $t('boats.boat.token_modal.title') }}
        </va-card-title>
        <va-card-content>
          <va-inner-loading :loading="isBusy">
            <p class="mb-3">{{ item.name }} ({{ item.mmsi }})</p>
            <template v-if="apiError">
              <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
            </template>
            <a id="copyToClipboard" class="button control is-medium" @click.prevent="copyToClipboard">
              <span class="icon">
                <i class="fa fa-clipboard"></i>
              </span>
            </a>
            <div>
              <va-input
                ref="clone"
                v-model="boatToken"
                :label="$t('boats.boat.token_modal.token') + ':'"
                placeholder="Readonly Token"
                @focus="$event.target.select()"
              />
              <va-alert color="warning" outline class="mb-4">{{ $t('boats.boat.token_modal.message') }}</va-alert>
            </div>
          </va-inner-loading>
        </va-card-content>
        <va-card-actions>
          <va-button class="ml-auto" color="primary" @click="ok">{{ $t('modals.close') }}</va-button>
        </va-card-actions>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import PostgSail from '../../services/postgsail.js'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
  })

  const isBusy = ref(true)
  const apiError = ref(null)
  const showModal = ref(false)
  const rowData = ref(null)
  //const email = ref('')
  const email = ref(GlobalStore.settings?.email || '')

  const boatToken = computed(() => {
    return rowData.value ? rowData.value : ''
  })

  async function handleGetToken() {
    isBusy.value = true
    apiError.value = null
    showModal.value = true
    const payload = {
      vessel_name: props.item.name,
      vessel_mmsi: props.item.mmsi,
      vessel_email: email.value,
    }
    try {
      const api = new PostgSail()
      const response = await api.vessel_reg(payload)
      if (response.data.token) {
        rowData.value = response.data.token
      } else {
        throw { response }
      }
    } catch ({ response }) {
      console.log(response)
      /*
      apiError.value = response.data.message
      console.warn("Could not get vessel's token", apiError)
      */
    } finally {
      isBusy.value = false
    }
  }

  const copyToClipboard = async () => {
    console.log(`handleGetToken ${boatToken.value}`)
    navigator.clipboard.writeText(boatToken.value)
  }
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
