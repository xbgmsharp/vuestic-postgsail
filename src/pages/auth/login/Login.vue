<template>
  <va-inner-loading :loading="isBusy">
    <form @submit.prevent="onsubmit">
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
        :label="t('auth.password')"
        :error="!!passwordErrors.length"
        :error-messages="passwordErrors"
      />

      <div class="auth-layout__options d-flex align--center justify--space-between">
        <va-checkbox v-model="keepLoggedIn" class="mb-0" :label="t('auth.keep_logged_in')" />
        <router-link class="ml-1 link" :to="{ name: 'recover-password' }">{{ t('auth.recover_password') }}</router-link>
      </div>

      <div class="d-flex justify--center mt-3">
        <va-button class="my-0" @click="onsubmit">{{ t('auth.login') }}</va-button>
      </div>
    </form>
  </va-inner-loading>
</template>

<script setup lang="ts">
  import PostgSail from '../../../services/postgsail.js'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  const isBusy = ref(false)
  const email = ref('')
  const password = ref('')
  const keepLoggedIn = ref(false)
  const emailErrors = ref<string[]>([])
  const passwordErrors = ref<string[]>([])

  const formReady = computed(() => !emailErrors.value.length && !passwordErrors.value.length)

  async function onsubmit() {
    emailErrors.value = email.value ? [] : [t('auth.errors.email')]
    passwordErrors.value = password.value ? [] : [t('auth.errors.password')]

    if (!formReady.value) return

    const payload = {
      email: email.value,
      pass: password.value,
    }
    try {
      isBusy.value = true
      const post = new PostgSail()
      var response = await post.login(payload)
      console.log(response)
      /*
      const response = await fetch(`http://localhost:3002/rpc/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      var response_data = await response.json()
      //console.log(response_data.token)
      localStorage.setItem('token', response_data.token)
      //useRouter().push({ name: 'dashboard' })
      window.location.reload()
      */
    } catch (error: any) {
      isBusy.value = false
      console.log(error)
    } finally {
      isBusy.value = false
    }
  }
</script>
