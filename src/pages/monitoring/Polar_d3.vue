<template>
  <template v-if="error">
    <div>{{ error }}</div>
  </template>
  <div>Work in progress</div>
  <div class="grid grid-cols-2 gap-4">
    <div class="main">
      <div id="polar" ref="polarContainer"></div>
    </div>

    <div>
      <textarea v-model="polarCSV" class="plot-only" />
    </div>
  </div>
</template>

<script setup>
  // Based on orc-data
  // https://github.com/jieter/orc-data/
  import { ref, onMounted } from 'vue'
  import { polarImport } from '../../utils/polar-csv.js'
  import { polarplot } from '../../utils/polarplot.js'

  const polarCSV = `twa/tws;6;8;10;12;14;16;20
0;0;0;0;0;0;0;0

# This is the polar of ITA14800, which is not in the database anymore

# Zeros are not plotted, you can use this to add optimal beat/run angles for a
# specific wind speed. In this case, VMG must be converted to SOG:
#   SOG = VMG / cos(beat_angle)

# Beat angles
44.2;5.02;0;0;0;0;0;0
42.9;0;5.99;0;0;0;0;0
42.5;0;0;6.81;0;0;0;0
40.8;0;0;0;7.17;0;0;0
39.3;0;0;0;0;7.31;0;0
38.3;0;0;0;0;0;7.39;0
38.4;0;0;0;0;0;0;7.53

52;5.58;6.71;7.54;7.9;8.06;8.15;8.25
60;5.97;7.13;7.82;8.14;8.3;8.4;8.49
75;6.33;7.46;8.03;8.36;8.62;8.83;9.02
90;6.41;7.69;8.09;8.36;8.66;8.98;9.54
110;6.35;7.63;8.31;8.79;9.07;9.27;9.68
120;6.15;7.54;8.22;8.65;9.15;9.52;10.07
135;5.48;6.78;7.75;8.26;8.69;9.2;10.45
150;4.54;5.7;6.76;7.58;8.12;8.52;9.46

# Run angles
142.1;4.98;0;0;0;0;0;0
144.7;0;6.04;0;0;0;0;0
144.9;0;0;7.15;0;0;0;0
153.4;0;0;0;7.38;0;0;0
159.4;0;0;0;0;7.71;0;0
166.9;0;0;0;0;0;7.92;0
173.1;0;0;0;0;0;0;8.54`

  const EMPTY_BOAT = {
    speeds: [],
    angles: [],
  }
  const boat = ref(EMPTY_BOAT)
  const error = ref(undefined)
  const polarContainer = ref()
  const plot = ref()

  onMounted(async () => {
    try {
      boat.value = polarImport(polarCSV)
      console.log(boat.value)
      error.value = undefined
      plot.value = polarplot(polarContainer.value)
      plot.value.render(boat.value)
      console.log(polarContainer.value)
    } catch (e) {
      console.log(e)
      boat.value = EMPTY_BOAT
      error.value = e
    }
  })
</script>

<style>
  svg .axis text {
    font: 10px sans-serif;
  }

  .axis line,
  .axis circle {
    fill: none;
    stroke: #777;
    stroke-dasharray: 1, 4;
  }

  .axis.sog-10 circle {
    stroke: #333 !important;
    stroke-dasharray: none !important;
  }

  .axis.sog-12 circle,
  .axis.sog-14 circle,
  .axis.sog-16 circle {
    stroke: #aaa;
  }

  .line {
    fill: none;
    stroke: red;
    stroke-width: 1.5px;
  }

  .legend rect {
    fill: #fff;
    stroke: #000;
    opacity: 0.8;
  }

  .highlight {
    stroke: #000;
    fill: #fff;
  }

  .tws-6 {
    stroke: #1f77b4;
    color: #1f77b4;
  }

  .tws-8 {
    stroke: #ff7f0e;
    color: #ff7f0e;
  }

  .tws-10 {
    stroke: #2ca02c;
    color: #2ca02c;
  }

  .tws-12 {
    stroke: #d62728;
    color: #d62728;
  }

  .tws-14 {
    stroke: #9467bd;
    color: #9467bd;
  }

  .tws-16 {
    stroke: #17becf;
    color: #17becf;
  }

  .tws-20 {
    stroke: #e377c2;
    color: #e377c2;
  }

  .polar-table td:hover {
    background-color: #eee;
  }

  .vmg-run,
  .vmg-beat {
    fill: #fff;
  }

  .meta span.meta-label {
    font-weight: 200;
    font-size: 14px;
    color: #aaa;
    padding: 0;
    display: inline-block;
    min-width: 100px;
  }

  .meta table {
    display: inline-block;
  }

  .meta table.meta-table td {
    padding-right: 10px;
    min-width: 100px;
  }

  .meta table .meta-label {
    color: #888;
  }

  input {
    margin-bottom: 2px;
  }

  .meta-item h2 {
    margin-top: 2px;
  }

  .meta-label.polar {
    display: block !important;
  }

  .meta-item textarea {
    width: 100%;
    height: 150px;
    max-width: 500px;
    font-family: monospace;
    font-size: 10px;
  }

  textarea {
    width: 100%;
    height: 160px;
    font-family: monospace;
    font-size: 10px;
  }

  textarea.plot-only {
    height: 600px;
  }

  textarea.extended {
    height: 380px;
  }

  .polar-table {
    font-size: 12px;
    max-width: 500px;
  }

  .polar-table tr th {
    white-space: nowrap;
  }

  .polar-table tr td:first-child {
    text-align: right;
  }

  .sailnumber {
    color: #888;
  }

  .dropdown {
    background-color: white;
  }

  .dropdown a {
    display: block;
    padding: 2px 4px;
    background-color: white;
  }

  .type {
    color: #aaa;
    size: 10px;
  }

  #main-nav {
    margin-bottom: 5px;
  }

  .sidebar-toggle {
    margin-top: 25px;
  }

  textarea {
    max-width: 500px;
  }

  #main {
    overflow-y: auto;
    height: 100%;
    padding-top: 5px;
  }

  label {
    font-weight: normal;
  }
</style>
