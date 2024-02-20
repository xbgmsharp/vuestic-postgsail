<template>
  <div>
    <template v-if="keyExists() != -1">
      <va-chip outline color="success">{{ value }}</va-chip>
    </template>
    <template v-else>
      <VaSelect
        v-model="value"
        :options="options"
        searchable
        highlight-matched-text
        @update:modelValue="handleSelect(sk_key, value, map)"
      />
    </template>
  </div>
</template>

<script>
  export default {
    name: 'Searchable',
    props: {
      data: String,
      object: Array,
      sk_key: Object,
      map: String,
    },
    emits: ['clickFromChildComponent'],
    data(props) {
      return {
        options: props.object,
        value: props.data,
      }
    },
    methods: {
      handleSelect: function (value, sk_key, map) {
        /*
        console.log(
          'clickFromChildComponent',
          value,
          options.find((option) => option.value === value),
        )
        */
        this.$emit('clickFromChildComponent', value, sk_key, map)
      },
      keyExists() {
        console.log(this.value, this.options)
        return this.options.indexOf(this.value)
      },
    },
  }
</script>
