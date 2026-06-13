<template>
  <VaForm id="signup-form" ref="form" name="signup" autocomplete="on" @submit.prevent="onsubmit()">
    <template v-if="apiError">
      <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
    </template>
    <template v-if="signupSuccess">
      <va-alert color="success" outline class="mb-4"> {{ $t('auth.account_created') }} </va-alert>
    </template>

    <va-input
      id="email"
      v-model="formData.email"
      name="email"
      type="email"
      autocomplete="username"
      class="mb-4"
      :label="t('auth.email')"
      :input-attrs="{ 'aria-label': t('auth.email') }"
      :rules="[(v) => !!v || t('auth.errors.email'), (v) => /.+@.+\..+/.test(v) || t('auth.errors.email_valid')]"
      placeholder="john@example.com"
    />

    <va-input
      id="password"
      v-model="formData.password"
      name="password"
      type="password"
      autocomplete="new-password"
      class="mb-4"
      :label="t('auth.password')"
      :input-attrs="{ 'aria-label': t('auth.password') }"
      :rules="[(v) => (v && v.length >= 4) || t('auth.errors.password')]"
      placeholder="******"
    />

    <va-input
      id="firstname"
      v-model="formData.firstName"
      name="firstname"
      type="text"
      autocomplete="given-name"
      class="mb-4"
      :label="t('auth.first_name')"
      :input-attrs="{ 'aria-label': t('auth.first_name') }"
      :rules="[(v) => (v && v.length > 2) || t('auth.errors.first_name')]"
      placeholder="John"
    />

    <va-input
      id="lastname"
      v-model="formData.lastName"
      name="lastname"
      type="text"
      autocomplete="family-name"
      class="mb-4"
      :label="t('auth.last_name')"
      :input-attrs="{ 'aria-label': t('auth.last_name') }"
      :rules="[(v) => (v && v.length > 2) || t('auth.errors.last_name')]"
      placeholder="Doe"
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
      <va-button type="submit" class="my-0 flexStatic" style="width: 100%">{{ t('auth.sign_up') }}</va-button>
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
    let formValid = validate()
    console.log(formReady.value, formData.email, emailErrors.value.length, formValid)
    if (!formValid) return
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
