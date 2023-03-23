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
            <p class="mb-3">
              {{ item.name }} <template v-if="item.mmsi">({{ item.mmsi }})</template>
            </p>
            <template v-if="apiError">
              <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
            </template>
            <!-- TODO use better CSS -->
            <div style="width: 700px; max-width: 800px">
              <va-input
                ref="clone"
                v-model="boatToken"
                type="textarea"
                :label="$t('boats.boat.token_modal.token') + ':'"
                placeholder="Readonly Token"
                :min-rows="3"
                :max-rows="5"
                @focus="$event.target.select()"
              >
                <template #appendInner>
                  <va-icon name="content_copy" @click="$vaToast.init({ message: copyToClipboard, color: 'primary' })" />
                </template>
              </va-input>
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
  import PostgSail from '../../services/api-client.js'
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

  const copyToClipboard = () => {
    console.log(`handleGetToken ${boatToken.value}`)
    navigator.clipboard.writeText(boatToken.value)
    return 'Token copy to clipboard'
  }
</script>

<style lang="scss" scoped></style>
