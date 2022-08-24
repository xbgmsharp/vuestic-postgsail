<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('logs.details.title') }}</va-card-title>
      <va-card-content>
        <p>Detailed logs here: {{ $route.params.id }}</p>
      </va-card-content>
    </va-card>
  </div>
</template>

<script>
  import { defineComponent } from 'vue'
  export default defineComponent({
    data() {
      return {}
    },
  })
</script>

<style lang="scss"></style>
