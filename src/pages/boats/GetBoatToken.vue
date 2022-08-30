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
            <div>
              <va-input
                :value="boatToken"
                :label="$t('boats.boat.token_modal.token') + ':'"
                placeholder="Readonly"
                readonly
              />
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

  defineProps({
    item: {
      type: Object,
      required: true,
    },
  })

  const isBusy = ref(true)
  const apiError = ref(null)
  const showModal = ref(false)
  const rowData = ref(null)

  const boatToken = computed(() => {
    return rowData.value && rowData.value.token ? rowData.value.token : ''
  })

  async function handleGetToken() {
    isBusy.value = true
    apiError.value = null
    showModal.value = true
    try {
      const api = new PostgSail()
      const response = await api.vessel_get_token()
      if (response.data) {
        this.rowData = response.data
      } else {
        throw { response }
      }
    } catch ({ response }) {
      apiError.value = response.data.message
      console.warn("Could not get vessel's token", apiError)
    } finally {
      isBusy.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .va-table {
    width: 100%;
  }
</style>
