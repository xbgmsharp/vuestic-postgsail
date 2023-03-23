<template>
  <va-card>
    <va-card-title>{{ $t('boats.details.title') }}</va-card-title>
    <va-card-content>
      <template v-if="apiError">
        <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
      </template>
      <template v-if="apiSuccess">
        <va-alert color="success" outline class="mb-4"> {{ $t('boats.boat.register') }} </va-alert>
      </template>
      <form @submit.prevent="handleSubmit()">
        <va-input
          v-model="email"
          class="mb-3"
          type="email"
          :label="t('auth.email')"
          :error="!!emailErrors.length"
          :error-messages="emailErrors"
          :readonly="true"
        />

        <va-input
          v-model="vessel_mmsi"
          class="mb-3"
          type="text"
          :label="t('boats.boat.mmsi')"
          :error="!!mmsiErrors.length"
          :error-messages="mmsiErrors"
        />

        <va-input
          v-model="vessel_name"
          class="mb-3"
          type="test"
          :label="t('boats.boat.name')"
          :error="!!nameErrors.length"
          :error-messages="nameErrors"
        />

        <div class="d-flex justify--center mt-3">
          <va-button class="my-0" :disabled="!canSubmit" @click="handleSubmit">{{
            t('auth.vessel_register')
          }}</va-button>
        </div>
      </form>
    </va-card-content>
  </va-card>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import PostgSail from '../../services/api-client.js'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const router = useRouter()
  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  //const email = ref('')
  const email = ref(GlobalStore.settings?.email || '')
  const vessel_mmsi = ref('')
  const vessel_name = ref('')
  const emailErrors = ref('')
  const mmsiErrors = ref('')
  const nameErrors = ref('')

  const formReady = computed(() => !emailErrors.value.length && !nameErrors.value.length)

  const canSubmit = computed(() => {
    /*
    emailErrors.value = email.value ? [] : ['Email is required']
    nameErrors.value = vessel_name.value ? [] : ['name is required']
    mmsiErrors.value = vessel_mmsi.value ? [] : ['mmsi is required']
    if (!mmsiErrors.value.length && vessel_mmsi.value.length) {
      mmsiErrors.value = /^\d+$/.test(vessel_mmsi.value) ? [] : ['not a valid mmsi, digit']
    }
    if (!mmsiErrors.value.length && vessel_mmsi.value.length < 6) {
      mmsiErrors.value = ['not a valid mmsi, length']
    }
    if (!(emailErrors.value.length || mmsiErrors.value.length || nameErrors.value.length)) return true
    */
    return true
  })

  const handleSubmit = async () => {
    isBusy.value = true
    apiError.value = null

    emailErrors.value = email.value ? [] : [t('auth.errors.email')]
    nameErrors.value = vessel_name.value ? [] : [t('boats.errors.name')]
    if (vessel_name.value.length <= 3) {
      nameErrors.value = [t('boats.errors.length')]
    }

    if (!formReady.value) return

    const api = new PostgSail()
    const payload = {
      vessel_name: vessel_name.value,
      vessel_mmsi: vessel_mmsi.value,
      vessel_email: email.value,
    }
    try {
      const response = await api.vessel_reg(payload)
      if (response.data) {
        apiSuccess.value = true
        if (response.data.token) {
          console.log('vessel_reg success', response.data.token)
          // Fetch updated settings then route
          await GlobalStore.fetchSettings()
          router.push({ name: 'boats' })
          /*setTimeout(() => {
            router.push({ name: 'boats' })
          }, 1000)
          */
        } else {
          console.error('API error, no valid token from server')
        }
      } else {
        throw { response }
      }
    } catch ({ response }) {
      // TODO error TS18046: 'response' is of type 'unknown'.
      //apiError.value = response.data.message
      console.warn('Error, please check your parameters')
    } finally {
      isBusy.value = false
    }
  }
</script>
