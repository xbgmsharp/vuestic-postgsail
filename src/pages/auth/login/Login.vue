<template>
  <va-inner-loading :loading="isBusy">
    <form @submit.prevent="onsubmit">
      <template v-if="loginError">
        <va-alert color="danger" outline class="mb-4"> {{ $t('auth.errors.cedentials') }} ({{ loginError }}) </va-alert>
      </template>
      <template v-if="tokenExpired">
        <va-alert color="warning" outline class="mb-4"> {{ $t('auth.errors.expired_session') }}</va-alert>
      </template>
      <va-input
        v-model="email"
        class="mb-3"
        type="email"
        :label="t('auth.email')"
        :error="!!emailErrors.length"
        :error-messages="emailErrors"
      />

      <va-input
        v-model="password"
        class="mb-3"
        type="password"
        autocomplete="off"
        :label="t('auth.password')"
        :error="!!passwordErrors.length"
        :error-messages="passwordErrors"
      />

      <div class="auth-layout__options d-flex align--center justify--space-between">
        <router-link class="ml-1 link" :to="{ name: 'recover-password' }">{{ t('auth.recover_password') }}</router-link>
      </div>

      <div class="d-flex justify--center mt-3">
        <va-button class="my-0" @click="onsubmit">{{ t('auth.login') }}</va-button>
      </div>
    </form>
  </va-inner-loading>
</template>

<script setup>
  import PostgSail from '../../../services/postgsail.js'
  import { computed, ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  const isBusy = ref(false)
  const email = ref(localStorage.getItem('email') || '')
  const password = ref('')
  const emailErrors = ref('')
  const passwordErrors = ref('')
  const loginError = ref(null)

  const router = useRouter()

  const route = useRoute()

  const tokenExpired = route.params.is401

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

    localStorage.setItem('email', email.value)

    try {
      const api = new PostgSail()
      const response = await api.login(payload)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push({ name: 'dashboard' })
      } else {
        throw { response }
      }
    } catch ({ response }) {
      loginError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }
</script>
