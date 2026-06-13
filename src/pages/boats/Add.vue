<template>
  <va-card>
    <va-card-title>{{ $t('boats.boat.title') }}</va-card-title>
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
          :disabled="true"
        />

        <va-input
          v-model="vessel_mmsi"
          class="mb-3"
          type="text"
          :error="!!mmsiErrors.length"
          :error-messages="mmsiErrors"
        >
          <template #label>
            {{ t('boats.boat.mmsi') }}
            <span style="color: var(--va-secondary)">{{ t('boats.boat.optional') }}</span>
          </template>
        </va-input>

        <div class="flex gap-2">
          <va-select
            v-model="vesselPrefix"
            :options="vesselOptions"
            label="prefix"
            track-by="value"
            value-by="value"
            text-by="description"
            outline
            class="w-full md:w-64"
          />
          <va-input
            v-model="vessel_name"
            class="mb-3"
            type="text"
            :error="!!nameErrors.length"
            :error-messages="nameErrors"
          >
            <template #label>
              {{ t('boats.boat.name') }}
              <span style="color: var(--va-danger)" aria-hidden="true"> *</span>
            </template>
          </va-input>
        </div>

        <div class="d-flex justify--center mt-3">
          <va-button class="my-0" :disabled="!canSubmit" @click="handleSubmit">{{
            t('auth.vessel_register')
          }}</va-button>
        </div>
      </form>

      <div
        class="sm:min-h-[114px] p-4 mt-6 rounded-lg border border-dashed border-primary flex flex-col sm:flex-row items-start sm:items-center gap-4 note"
        :style="{ backgroundColor: colorToRgba(getColor('primary'), 0.07) }"
      >
        <div class="flex flex-col gap-2 flex-grow">
          <div class="text-lg font-bold leading-relaxed">Important note</div>
          <div class="text-secondary text-sm leading-tight">
            PostgSail Cloud is Open Source and free for personal use with a single vessel. If you encounter any issue
            validating your account, please contact us at info@openplotter.cloud.
          </div>

          <div class="text-secondary text-sm leading-tight">
            <a href="mailto:info@openplotter.cloud?subject=PostgSail Cloud&body=Issue adding my boat" target="_blank">
              <VaButton class="d-flex w-full">Contact us</VaButton>
            </a>
          </div>
        </div>
      </div>
    </va-card-content>
  </va-card>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import PostgSail from '../../services/api-client'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useColors } from 'vuestic-ui'
  import { useGlobalStore } from '../../stores/global-store'

  const { getColor, colorToRgba } = useColors()
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

  /* Vessel */
  const vesselOptions = ref([
    { value: 'SV', text: 'SV', description: 'SV - Sailing Vessel' },
    { value: 'MV', text: 'MV', description: 'MV - Motor Vessel' },
    { value: 'SY', text: 'SY', description: 'SY - Sailing Yacht' },
    { value: 'MY', text: 'MY', description: 'MY - Motor Yacht' },
  ])
  const vesselPrefix = ref('SV')
  const vesselName = ref('')

  // Get current prefix description
  const vesselPrefixDescription = computed(() => {
    const option = vesselOptions.value.find((opt) => opt.value === vesselPrefix.value)
    return option ? option.description : ''
  })

  const formReady = computed(() => !emailErrors.value.length && !mmsiErrors.value.length && !nameErrors.value.length)

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
    if (vessel_mmsi.value.length > 0 && !/^\d+$/.test(vessel_mmsi.value)) {
      mmsiErrors.value = [t('boats.errors.mmsi')]
    }
    if (!mmsiErrors.value.length && vessel_mmsi.value.length > 0 && vessel_mmsi.value.length != 9) {
      mmsiErrors.value = [t('boats.errors.mmsi')]
    }

    if (!formReady.value) return

    const api = new PostgSail()
    const payload = {
      vessel_name: `${vesselPrefix.value} ${vessel_name.value}`,
      vessel_mmsi: vessel_mmsi.value,
      vessel_email: email.value,
    }
    try {
      const response = await api.vessel_reg(payload)
      if (response.token) {
        apiSuccess.value = true
        if (response.token) {
          console.log('vessel_reg success', response.token)
          // Fetch updated settings then route
          await GlobalStore.fetchSettings(true)
          router.push({ name: 'boats' })
          /*
          setTimeout(() => {
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
      apiError.value = t('boats.errors.param')
      console.warn('Error, please check your parameters')
    } finally {
      isBusy.value = false
    }
  }
</script>
