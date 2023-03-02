<template>
  <va-card class="mb-3">
    <va-card-title>{{ $t('auth.otp') }}</va-card-title>
    <va-card-content>
      <div class="box layout gutter-md">
        <strong>{{ $t('auth.pushover_message') }}</strong>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
        </template>
        <template v-if="otpSuccess">
          <va-alert color="success" outline class="mb-4"> {{ $t('auth.otp_validated') }} </va-alert>
        </template>
      </div>
    </va-card-content>
  </va-card>
</template>

<script setup>
  import PostgSail from '../../services/postgsail.js'
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const otpSuccess = ref(null)

  const otpErrors = ref('')

  const router = useRouter()
  const route = useRoute()
  const otpcode = ref(route.query.token || '')
  console.log(route.query.token)
  console.log(route.query.pushover_user_key)

  const formReady = computed(() => {
    return !otpErrors.value.length
  })

  onMounted(async () => {
    otpErrors.value = otpcode.value ? [] : [t('auth.errors.otp')]
    otpErrors.value = !isNaN(otpcode.value) ? [] : [t('auth.errors.otp')]
    otpErrors.value = otpcode.value.length == 6 ? [] : [t('auth.errors.otp')]

    if (!formReady.value) return

    const payload = {
      token: otpcode.value,
      pushover_user_key: route.query.pushover_user_key || '',
    }

    apiError.value = null
    isBusy.value = true

    try {
      const api = new PostgSail()
      const response = await api.pushover(payload)
      if (typeof response.data === 'boolean' && response.data) {
        otpSuccess.value = true
        // Fetch updated settings then route
        GlobalStore.fetchSettings()
        router.push({ path: '/profile' })
        /*setTimeout(() => {
          router.push({ path: '/' })
        }, 1000)
        */
      } else {
        throw { response }
      }
    } catch ({ response }) {
      apiError.value = t('auth.errors.otp_invalid')
    } finally {
      isBusy.value = false
    }
  })
</script>

<style>
  .box {
    align-items: center;
    justify-content: center;
    /*background: white;*/
    border-radius: 10px;
    border: 1px solid #ccc;
    padding: 20px 10px;
    text-align: center;
    width: 40%;
  }

  strong {
    display: block;
    margin-bottom: 10px;
  }

  .code {
    border: 0px;
    text-align: center;
    border-bottom: 3px solid #999;
    width: 30px;
    margin: 0px 10px;
    font-weight: bold;
    font-size: 20px;
    padding-bottom: 5px;
  }
</style>
