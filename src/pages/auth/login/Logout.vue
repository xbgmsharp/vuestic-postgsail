<template>
  <va-inner-loading loading>
    <p>{{ $t('auth.logout') }}</p>
  </va-inner-loading>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router'

  localStorage.removeItem('token')
  localStorage.removeItem('settings')
  const route = useRoute()
  const router = useRouter()
  const is401 = route.params.is401
  router.push({ name: 'login', params: { is401 } })
</script>
