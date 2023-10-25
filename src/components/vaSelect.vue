<template>
  <div>
    <va-select
      v-model="value"
      class="mb-6"
      :options="options"
      value-by="value"
      outline
      @update:modelValue="handleSelect(value, options)"
    />
  </div>

  <va-alert color="info">
    <template #title> Value </template>
    {{ value }}
  </va-alert>
</template>

<script>
  export default {
    name: 'MySelect',
    props: {
      data: Number,
      id: Number,
      object: Array,
    },
    emits: ['clickFromChildComponent'],
    data(props) {
      return {
        item: props.id,
        value: props.data,
        options: props.object,
      }
    },
    methods: {
      handleSelect: function (value, options) {
        /*
        console.log(
          'clickFromChildComponent',
          value,
          options.find((option) => option.value === value),
        )
        */
        this.$emit(
          'clickFromChildComponent',
          value,
          options.find((option) => option.value === value),
        )
      },
    },
  }
</script>
