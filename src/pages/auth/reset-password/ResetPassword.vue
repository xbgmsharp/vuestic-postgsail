<template>
  <VaForm ref="form" class="login" @submit.prevent="onsubmit">
    <template v-if="resetError">
      <va-alert color="warning" outline class="mb-4"> {{ t('auth.errors.reset') }}</va-alert>
    </template>
    <template v-if="resetSuccess">
      <va-alert color="success" outline class="mb-4"> {{ t('auth.reset') }} </va-alert>
    </template>
    <va-inner-loading :loading="isBusy">
      <va-input
        id="Password"
        v-model="formData.password"
        placeholder="New password"
        class="mb-4"
        type="password"
        autocomplete="off"
        :label="t('auth.password')"
        :rules="[(value) => (value && value.length >= 4) || t('auth.errors.password')]"
        aria-label="Password"
      />
      <va-input
        id="password_repeat"
        v-model="formData.password_confirm"
        placeholder="Repeat new password"
        class="mb-4"
        type="password"
        autocomplete="off"
        :label="t('auth.password')"
        :rules="[(value) => (value && value.length >= 4) || t('auth.errors.password')]"
        aria-label="password_repeat"
      />
      <div class="flex justify-center mt-4">
        <va-button class="my-0" @click="onsubmit">{{ t('auth.reset_password') }}</va-button>
      </div>
    </va-inner-loading>
  </VaForm>
</template>

<script setup lang="ts">
  import PostgSail from '../../../services/api-client'
  import { ref, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useForm } from 'vuestic-ui'
  const { validate } = useForm('form')
  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()

  const resetError = ref(false)
  const resetSuccess = ref(false)
  //const password = ref('')
  //const password_confirm = ref('')
  const passwordErrors = ref<string[]>([])
  const uuid = ref(route.query.uuid || '')
  const token = ref(route.query.token || '')

  const isBusy = ref(false)

  const formData = reactive({
    password: '',
    password_confirm: '',
  })

  async function onsubmit() {
    console.log('reset', validate())
    if (!validate()) return
    if (!formData.password || !formData.password_confirm) {
      passwordErrors.value = [t('auth.errors.password')]
    } else {
      if (formData.password != formData.password_confirm) {
        passwordErrors.value = [t('auth.errors.mismatch_pass')]
        console.warn('mismatch pass')
        resetError.value = true
        return
      }
      if (formData.password.length <= 4) {
        console.warn('short pass')
        passwordErrors.value = [t('auth.errors.short_pass')]
        resetError.value = true
        return
      }
      if (uuid.value == '' || uuid.value.length != 12) {
        console.warn('Invalid uuid')
        resetError.value = true
        return
      }
      if (Number.isInteger(token.value) || token.value.length != 6) {
        console.warn('Invalid token')
        resetError.value = true
        return
      }

      isBusy.value = true
      const payload = {
        pass: formData.password,
        uuid: uuid.value,
        token: token.value,
      }

      try {
        const api = new PostgSail(),
          response = await api.reset(payload)
        if (response) {
          resetSuccess.value = true
          setTimeout(() => {
            router.push({ path: '/login' })
          }, 1100)
        } else {
          console.warn('reset', response)
          throw { response }
        }
      } catch ({ response }) {
        resetError.value = true
        console.warn(response)
      } finally {
        isBusy.value = false
      }
    }
  }
</script>
