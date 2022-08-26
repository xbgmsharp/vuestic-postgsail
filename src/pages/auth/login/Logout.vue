<template>
  <va-inner-loading loading>
    <p>{{ $t('auth.logout') }}</p>
  </va-inner-loading>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  localStorage.removeItem('token')
  const router = useRouter()
  router.push({ name: 'login' })
</script>
