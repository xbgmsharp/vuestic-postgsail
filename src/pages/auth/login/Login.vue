<template>
  <va-inner-loading :loading="isBusy">
    <VaForm id="login-form" ref="form" name="login" autocomplete="on" @submit.prevent="onsubmit">
      <template v-if="loginError">
        <va-alert color="danger" outline class="mb-4">
          {{ $t('auth.errors.credentials') }} ({{ loginError }})
        </va-alert>
      </template>
      <template v-if="tokenExpired">
        <va-alert color="warning" outline class="mb-4"> {{ $t('auth.errors.expired_session') }}</va-alert>
      </template>
      <VaInput
        id="email-input"
        v-model="email"
        name="email"
        autocomplete="username webauthn"
        class="mb-4"
        type="email"
        :label="$t('auth.email')"
        :rules="[(v) => !!v || t('auth.errors.email'), (v) => /.+@.+\..+/.test(v) || t('auth.errors.email_valid')]"
        aria-label="Email"
        placeholder="john@example.com"
      >
        <template #appendInner>
          <VaIcon name="mail_outline" color="secondary" />
        </template>
      </VaInput>

      <VaInput
        id="password-input"
        v-model="password"
        name="password"
        autocomplete="current-password"
        class="mb-4"
        type="password"
        :label="$t('auth.password')"
        :rules="[(value) => (value && value.length >= 4) || t('auth.errors.password')]"
        aria-label="Password"
        placeholder="******"
      >
        <template #appendInner>
          <VaIcon name="lock_outline" color="secondary" />
        </template>
      </VaInput>

      <div class="auth-layout__options flex items-center justify-between">
        <va-checkbox v-model="keepLoggedIn" class="mb-0" :label="$t('auth.keep_logged_in')" />
        <router-link class="ml-1 va-link text-right" :to="{ name: 'recover-password' }">{{
          $t('auth.recover_password')
        }}</router-link>
      </div>

      <div class="flex justify-center mt-4">
        <va-button type="submit" class="my-0 flexStatic" style="width: 100%">{{ $t('auth.login') }}</va-button>
      </div>
    </VaForm>
  </va-inner-loading>
</template>

<script setup>
  import PostgSail from '../../../services/api-client'
  import { computed, ref, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../../stores/global-store'
  import { useForm, useToast } from 'vuestic-ui'

  // Clean up previous localStorage
  localStorage.removeItem('settings')

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()
  const { validate } = useForm('form')
  const { push } = useRouter()
  const { init } = useToast()

  const formData = reactive({
    email: '',
    password: '',
    keepLoggedIn: false,
  })

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
    let formValid = validate()
    console.log(formReady.value, email.value, emailErrors.value.length, formValid)
    if (!formValid) return
    if (!formReady.value) return
    if (email.value.indexOf('+') > -1 && !email.value.indexOf('openplotter.cloud')) {
      emailErrors.value = ['invalid email format']
      loginError.value = 'invalid email format'
      return
    }

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
