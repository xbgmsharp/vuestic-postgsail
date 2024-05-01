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
  const optionsHash = {
    1: 'Unknown',
    2: 'Anchor',
    3: 'Mooring Buoy',
    4: 'Dock',
  }

  export const getTextForStayId = (value) => {
    return optionsHash[value]
  }

  export default {
    name: 'StayAt',
    props: {
      data: Number,
      id: Number,
    },
    emits: ['clickFromChildComponent'],
    data(props) {
      const options = Object.entries(optionsHash).map(([value, text]) => ({
        value: parseInt(value),
        text: text,
      }))

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
    },
  }
</script>
