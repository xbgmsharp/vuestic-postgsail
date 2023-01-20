<template>
  <steelseries-display-multi
    :width="width"
    :height="height"
    :value="object.value"
    :altValue="object.altValue"
    :lcdDecimals="object.lcdDecimals"
    :headerString="object.headerString"
    :detailString="object.detailString"
    :unitString="object.unitString"
    valuesNumeric
    headerStringVisible
    detailStringVisible
    unitStringVisible
  ></steelseries-display-multi>
</template>

<script>
  import 'steelseries'

  export default {
    props: {
      id: String,
      display: Object,
    },
    data() {
      return {
        width: 180,
        height: 70,
        object: this.display,
      }
    },
    computed: {},
    watch: {
      display: {
        handler: function () {
          /*
        console.log('DisplayMulti handler');
        console.log('to update:' + this.display.value);
        console.log('to update:' + this.display.headerString);
        */
          /***
        this.canva_id.setValue(this.display.value);
        if (this.display.altvalue != 0) {
          this.canva_id.setAltValue(this.display.altvalue);
        }
        ***/
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.graph()
    },
    methods: {
      graph: function () {
        //console.log(this.object)
      },
    },
  }
</script>

<style>
  canvas {
    padding-left: 0;
    padding-right: 0;
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
  table {
    width: 100%;
  }
</style>
