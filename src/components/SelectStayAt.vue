<template>
  <div>
    <va-select
      v-model="value"
      class="mb-6"
      :options="options"
      value-by="value"
      outline
      @update:modelValue="handleSelect(value, item)"
    />
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { ref } from 'vue'

  const { t } = useI18n()

  const props = defineProps({
    data: Number,
    id: Number,
  })
  const emit = defineEmits(['clickFromChildComponent'])

  const optionsHash = {
    1: t('id.stay_code.1'),
    2: t('id.stay_code.2'),
    3: t('id.stay_code.3'),
    4: t('id.stay_code.4'),
  }

  const options = Object.entries(optionsHash).map(([value, text]) => ({
    value: parseInt(value),
    text: text,
  }))

  const item = ref(props.id)
  const value = ref(props.data)

  function handleSelect(value, item) {
    emit('clickFromChildComponent', value, item)
  }
</script>
