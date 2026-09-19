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
  import { ref, computed } from 'vue'
  import { useStayTypes } from '../queries/stay-types'
  import { getStayTypeOptions } from '../utils/PostgSail'

  const props = defineProps({
    data: Number,
    id: Number,
  })
  const emit = defineEmits(['clickFromChildComponent'])

  // Same query the Stay Types settings tab uses — RLS already scopes
  // vessel_id != null rows to the current vessel, so no extra filtering by
  // vessel needed here, only splitting built-in vs custom.
  const { data: stayTypesData } = useStayTypes()
  const customStayTypes = computed(() => (stayTypesData.value ?? []).filter((row) => row.vessel_id != null))

  // One canonical, translated list — built-ins from stayed_at_options plus
  // this vessel's custom types. Previously this component had its own
  // hardcoded 4-entry optionsHash (codes 1-4 only), which is why custom
  // types never showed up here even after being added in Settings.
  const options = computed(() => getStayTypeOptions(customStayTypes.value))

  const item = ref(props.id)
  const value = ref(props.data)

  function handleSelect(value, item) {
    emit('clickFromChildComponent', value, item)
  }
</script>
