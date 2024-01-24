<template>
  <VaForm ref="form" class="login" @submit.prevent="onsubmit">
    <template v-if="resetSuccess">
      <va-alert color="success" outline class="mb-4"> {{ t('auth.reset') }} </va-alert>
    </template>
    <va-input
      id="Email"
      v-model="formData.email"
      class="mb-4"
      type="email"
      :label="t('auth.email')"
      :rules="[(v) => !!v || t('auth.errors.email'), (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
      aria-label="Email"
    />

    <div class="flex justify-center mt-4">
      <va-button class="my-0" @click="onsubmit">{{ t('auth.reset_password') }}</va-button>
    </div>
  </VaForm>
</template>

<script setup lang="ts">
  import { useGlobalStore } from '../../../stores/global-store'
  import PostgSail from '../../../services/api-client'
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useForm } from 'vuestic-ui'
  const { validate } = useForm('form')
  const { t } = useI18n()
  const router = useRouter()

  //debugger
  useGlobalStore().logout()

  const resetSuccess = ref('')
  const email = ref('')
  const formData = reactive({
    email: '',
  })
  const emailErrors = ref<string[]>([])

  const isBusy = ref(false)

  async function onsubmit() {
    console.log('recover', validate())
    if (!validate()) return
    if (!formData.email) {
      emailErrors.value = email.value ? [] : [t('auth.errors.email')]
    } else {
      isBusy.value = true
      const payload = {
        email: formData.email,
      }

      try {
        const api = new PostgSail(),
          response = await api.recover(payload)
        // Should we report error if user does not exist. No to avoid security risk the api true.
        if (response) {
          resetSuccess.value = t('auth.reset')
          setTimeout(() => {
            router.push({ path: '/' })
          }, 1100)
        } else {
          console.warn('recover', response)
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
