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
  <!--
  <va-alert color="info">
    <template #title> Value </template>
    {{ value }}
  </va-alert>
  -->
</template>

<script>
  export default {
    name: 'StayAt',
    props: {
      data: Number,
      id: Number,
    },
    emits: ['clickFromChildComponent'],
    data(props) {
      const options = [
        {
          value: 1,
          text: 'Unknown',
        },
        {
          value: 2,
          text: 'Anchor',
        },
        {
          value: 3,
          text: 'Mooring Buoy',
        },
        {
          value: 4,
          text: 'Dock',
        },
      ]

      return {
        item: props.id,
        value: props.data,
        options,
      }
    },
    methods: {
      handleSelect: function (value, item) {
        //console.log('clickFromChildComponent', value, item)
        this.$emit('clickFromChildComponent', value, item)
      },
      getTextForValue: function (value) {
        const option = this.options.find((option) => option.value === value)
        return option ? option.text : null
      },
    },
  }
</script>
