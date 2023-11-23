<template>
  <va-inner-loading :loading="isBusy">
    <form @submit.prevent="onsubmit">
      <template v-if="loginError">
        <va-alert color="danger" outline class="mb-4">
          {{ $t('auth.errors.credentials') }} ({{ loginError }})
        </va-alert>
      </template>
      <template v-if="tokenExpired">
        <va-alert color="warning" outline class="mb-4"> {{ $t('auth.errors.expired_session') }}</va-alert>
      </template>
      <va-input
        id="Email"
        v-model="email"
        class="mb-4"
        type="email"
        :label="$t('auth.email')"
        :error="!!emailErrors.length"
        :error-messages="emailErrors"
        aria-label="Email"
      />

      <va-input
        id="Password"
        v-model="password"
        class="mb-4"
        type="password"
        :label="$t('auth.password')"
        :error="!!passwordErrors.length"
        :error-messages="passwordErrors"
        aria-label="Password"
      />

      <div class="auth-layout__options flex items-center justify-between">
        <va-checkbox v-model="keepLoggedIn" class="mb-0" :label="$t('auth.keep_logged_in')" />
        <router-link class="ml-1 va-link text-right" :to="{ name: 'recover-password' }">{{
          $t('auth.recover_password')
        }}</router-link>
      </div>

      <div class="flex justify-center mt-4">
        <va-button class="my-0 flexStatic" @click="onsubmit">{{ $t('auth.login') }}</va-button>
      </div>
    </form>
  </va-inner-loading>
</template>

<script setup>
  import PostgSail from '../../../services/api-client'
  import { computed, ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../../stores/global-store'

  // Clean up previous localStorage
  localStorage.removeItem('settings')

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const isBusy = ref(false)
  const email = ref(GlobalStore.settings?.email || '')
  const password = ref('')
  const keepLoggedIn = ref(false)
  const emailErrors = ref('')
  const passwordErrors = ref('')
  const loginError = ref(null)

  const router = useRouter()

  const route = useRoute()

  const tokenExpired = route.query.is401
  const next_route = ref(route.query.next || route.params.next || null)

  const formReady = computed(() => !emailErrors.value.length && !passwordErrors.value.length)

  async function onsubmit() {
    emailErrors.value = email.value ? [] : [t('auth.errors.email')]
    passwordErrors.value = password.value ? [] : [t('auth.errors.password')]

    if (!formReady.value) return

    loginError.value = null
    isBusy.value = true
    const payload = {
      email: email.value,
      pass: password.value,
    }

    try {
      const api = new PostgSail(),
        response = await api.login(payload)
      if (response.token) {
        api.setBearerAuth(GlobalStore.login(response.token, keepLoggedIn.value))
        // Fetch updated settings then route
        await GlobalStore.fetchSettings(true)
        if (next_route.value) {
          // Follow next query-string if isLoggedIn
          router.push({ path: next_route.value })
          return
        }
        router.push({ name: GlobalStore.preferredHomepage })
      } else {
        throw { response }
      }
    } catch (error) {
      //console.error(error)
      loginError.value = error
    } finally {
      isBusy.value = false
    }
  }
</script>
