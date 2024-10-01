<template>
  <VaForm ref="form" @submit.prevent="onsubmit()">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
    </template>
    <template v-if="signupSuccess">
      <va-alert color="success" outline class="mb-4"> {{ $t('auth.account_created') }} </va-alert>
    </template>

    <va-input
      id="Email"
      v-model="formData.email"
      class="mb-4"
      type="email"
      :label="t('auth.email')"
      aria-label="Email"
      :rules="[(v) => !!v || t('auth.errors.email'), (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
    />

    <va-input
      id="Password"
      v-model="formData.password"
      class="mb-4"
      type="password"
      :label="t('auth.password')"
      :rules="[(value) => (value && value.length >= 4) || t('auth.errors.password')]"
      aria-label="Password"
    />

    <va-input
      id="firstName"
      v-model="formData.firstName"
      class="mb-4"
      type="firstName"
      :label="t('auth.first_name')"
      :rules="[(value) => (value && value.length > 2) || t('auth.errors.first_name')]"
      aria-label="firstName"
    />

    <va-input
      id="lastName"
      v-model="formData.lastName"
      class="mb-4"
      type="lastName"
      :label="t('auth.last_name')"
      :rules="[(value) => (value && value.length > 2) || t('auth.errors.last_name')]"
      aria-label="lastName"
    />

    <div class="auth-layout__options flex items-center justify-between">
      <va-checkbox
        id="agreedToTerms"
        v-model="formData.agreedToTerms"
        class="mb-0"
        :rules="[(v) => v || t('auth.errors.agreed_to_terms')]"
        aria-label="agreedToTerms"
      >
        <template #label>
          <span class="ml-2">
            {{ t('auth.agree') }}
            <span class="va-link">{{ t('auth.termsOfUse') }}</span>
          </span>
        </template>
      </va-checkbox>
      <router-link class="ml-1 va-link text-right" :to="{ name: 'recover-password' }">
        {{ t('auth.recover_password') }}
      </router-link>
    </div>

    <div class="flex justify-center mt-4">
      <va-button class="my-0 flexStatic" @click="onsubmit">{{ t('auth.sign_up') }}</va-button>
    </div>
  </VaForm>
</template>

<script setup>
  import PostgSail from '../../../services/api-client'
  import { ref, computed, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useGlobalStore } from '../../../stores/global-store'
  import { useForm, useToast } from 'vuestic-ui'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const formData = reactive({
    email: '',
    password: '',
    firstNameErrors: '',
    lastNameErrors: '',
    agreedToTerms: false,
  })

  const isBusy = ref(false)
  const apiError = ref(null)
  const signupSuccess = ref(null)
  const emailErrors = ref('')
  const passwordErrors = ref('')
  const firstNameErrors = ref('')
  const lastNameErrors = ref('')
  const agreedToTermsErrors = ref('')

  const router = useRouter()
  const { validate } = useForm('form')
  const { push } = useRouter()
  const { init } = useToast()

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
    emailErrors.value = formData.email ? [] : [t('auth.errors.email')]
    passwordErrors.value = formData.password ? [] : [t('auth.errors.password')]
    firstNameErrors.value = formData.firstName ? [] : [t('auth.errors.first_name')]
    lastNameErrors.value = formData.lastName ? [] : [t('auth.errors.last_name')]
    agreedToTermsErrors.value = formData.agreedToTerms ? [] : [t('auth.errors.agreed_to_terms')]

    console.log(formReady.value, formData.email, emailErrors.value.length, validate())
    if (!validate()) return
    if (!formReady.value) return
    if (formData.email.indexOf('+') > -1) {
      emailErrors.value = ['invalid email format']
      apiError.value = 'invalid email format'
      return
    }
    const payload = {
      email: formData.email,
      pass: formData.password,
      firstname: formData.firstName,
      lastname: formData.lastName,
    }

    apiError.value = null
    isBusy.value = true

    try {
      const api = new PostgSail()
      const response = await api.signin(payload)
      if (response && response.token) {
        signupSuccess.value = true
        api.setBearerAuth(GlobalStore.login(response.token, false))
        // Fetch updated settings then route
        await GlobalStore.fetchSettings(true)
        // Popup success
        init({
          message: t('auth.account_created'),
          color: 'success',
        })
        //redirect to activate page in 1sec
        setTimeout(() => {
          push({ name: 'activate' })
        }, 1100)
      } else {
        console.warn('signin', response)
        throw { response }
      }
    } catch ({ response }) {
      apiError.value = response.message
    } finally {
      isBusy.value = false
    }
  }
</script>
