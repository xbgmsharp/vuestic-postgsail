<template>
  <form @submit.prevent="onsubmit()">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
    </template>
    <template v-if="signupSuccess">
      <va-alert color="success" outline class="mb-4"> {{ $t('auth.account_created') }} </va-alert>
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
      :label="t('auth.password')"
      :error="!!passwordErrors.length"
      :error-messages="passwordErrors"
    />

    <va-input
      v-model="firstName"
      class="mb-3"
      type="firstName"
      :label="t('auth.first_name')"
      :error="!!firstNameErrors.length"
      :error-messages="firstNameErrors"
    />

    <va-input
      v-model="lastName"
      class="mb-3"
      type="lastName"
      :label="t('auth.last_name')"
      :error="!!lastNameErrors.length"
      :error-messages="lastNameErrors"
    />

    <div class="auth-layout__options d-flex align--center justify--space-between">
      <va-checkbox
        v-model="agreedToTerms"
        class="mb-0"
        :error="!!agreedToTermsErrors.length"
        :error-messages="agreedToTermsErrors"
      >
        <template #label>
          <span class="ml-2">
            {{ t('auth.agree') }}
            <span class="link">{{ t('auth.termsOfUse') }}</span>
          </span>
        </template>
      </va-checkbox>
      <router-link class="ml-1 link" :to="{ name: 'recover-password' }">
        {{ t('auth.recover_password') }}
      </router-link>
    </div>

    <div class="d-flex justify--center mt-3">
      <va-button class="my-0" @click="onsubmit">{{ t('auth.sign_up') }}</va-button>
    </div>
  </form>
</template>

<script setup>
  import PostgSail from '../../../services/postgsail.js'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const signupSuccess = ref(null)
  const email = ref('')
  const password = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const agreedToTerms = ref(false)
  const emailErrors = ref('')
  const passwordErrors = ref('')
  const firstNameErrors = ref('')
  const lastNameErrors = ref('')
  const agreedToTermsErrors = ref('')

  const router = useRouter()

  const formReady = computed(() => {
    return !(
      emailErrors.value.length ||
      passwordErrors.value.length ||
      firstNameErrors.value.length ||
      lastNameErrors.value.length ||
      agreedToTermsErrors.value.length
    )
  })

  async function onsubmit() {
    emailErrors.value = email.value ? [] : [t('auth.errors.email')]
    passwordErrors.value = password.value ? [] : [t('auth.errors.password')]
    firstNameErrors.value = firstName.value ? [] : [t('auth.errors.first_name')]
    lastNameErrors.value = lastName.value ? [] : [t('auth.errors.last_name')]
    agreedToTermsErrors.value = agreedToTerms.value ? [] : [t('auth.errors.agreed_to_terms')]

    if (!formReady.value) return

    const payload = {
      email: email.value,
      pass: password.value,
      firstname: firstName.value,
      lastname: lastName.value,
    }

    apiError.value = null
    isBusy.value = true

    try {
      const api = new PostgSail()
      const response = await api.signin(payload)
      if (response.data.token) {
        signupSuccess.value = true
        api.API.defaults.headers['Authorization'] = 'Bearer ' + (GlobalStore.token = response.data.token)
        GlobalStore.userName = response.data.username
        setTimeout(() => {
          router.push({ path: '/' })
        }, 1100)
      } else {
        throw { response }
      }
    } catch ({ response }) {
      apiError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }
</script>
