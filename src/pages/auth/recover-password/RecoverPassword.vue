<template>
  <form class="login" @submit.prevent="onsubmit">
    <template v-if="resetSuccess">
      <va-alert color="success" outline class="mb-4"> {{ $t('auth.reset') }} </va-alert>
    </template>
    <va-input
      v-model="email"
      class="mb-4"
      type="email"
      :label="t('auth.email')"
      :error="!!emailErrors.length"
      :error-messages="emailErrors"
    />

    <div class="flex justify-center mt-4">
      <va-button type="submit" class="my-0">{{ t('auth.reset_password') }}</va-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { useGlobalStore } from '../../../stores/global-store'
  import PostgSail from '../../../services/api-client.js'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  const router = useRouter()

  const GlobalStore = useGlobalStore()

  GlobalStore.token = ''
  GlobalStore.userName = ''
  localStorage.removeItem('global')

  const resetSuccess = ref('')
  const email = ref('')
  const emailErrors = ref<string[]>([])

  const isBusy = ref(false)

  async function onsubmit() {
    if (!email.value) {
      emailErrors.value = email.value ? [] : [t('auth.errors.email')]
    } else {
      isBusy.value = true
      const payload = {
        email: email.value,
      }

      try {
        const api = new PostgSail(),
          response = await api.recover(payload)
        console.warn(response)
        if (response) {
          resetSuccess.value = t('auth.reset')
          setTimeout(() => {
            router.push({ path: '/' })
          }, 1100)
        } else {
          throw { response }
        }
      } catch ({ response }) {
        console.warn(response)
      } finally {
        isBusy.value = false
      }
    }
  }
</script>
