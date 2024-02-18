<template>
  <div>
    <VaSelect
      v-model="value"
      :options="options"
      searchable
      highlight-matched-text
      @update:modelValue="handleSelect(sk_key, value)"
    />
  </div>
</template>

<script>
  export default {
    name: 'Searchable',
    props: {
      data: String,
      object: Array,
      sk_key: Object,
    },
    emits: ['clickFromChildComponent'],
    data(props) {
      return {
        //options: ['aabbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
        options: props.object,
        value: props.data,
      }
    },
    methods: {
      handleSelect: function (value, sk_key) {
        /*
        console.log(
          'clickFromChildComponent',
          value,
          options.find((option) => option.value === value),
        )
        */
        this.$emit('clickFromChildComponent', value, sk_key)
      },
    },
  }
</script>
