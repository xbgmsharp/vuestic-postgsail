<script setup>
  import { computed } from 'vue'
  import VChart from 'vue-echarts'
  import { GraphChart } from 'echarts/charts'
  import { TitleComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { use } from 'echarts/core'

  use([GraphChart, TitleComponent, TooltipComponent, CanvasRenderer])

  const props = defineProps({
    nodes: {
      type: Array,
      required: true,
      default: () => [],
    },
    edges: {
      type: Array,
      required: true,
      default: () => [],
    },
    weightBy: {
      type: String,
      default: 'frequency',
      validator: (v) => ['frequency', 'distance', 'duration'].includes(v),
    },
    minTrips: {
      type: Number,
      default: 1,
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: 'light',
    },
  })

  const getNodeColor = (name) => {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const chartOptions = computed(() => {
    const nodes = props.nodes.map((node) => ({
      id: node.name,
      name: node.name,
      symbolSize: Math.max(20, Math.min(80, node.visits * 3)),
      value: node.visits,
      itemStyle: { color: getNodeColor(node.name) },
      label: { show: props.showLabels },
    }))

    const links = props.edges
      .filter((edge) => edge.count >= props.minTrips)
      .map((edge) => {
        const value =
          props.weightBy === 'distance' ? edge.distance : props.weightBy === 'duration' ? edge.duration : edge.count

        return {
          source: edge.source,
          target: edge.target,
          value,
          count: edge.count,
          distance: edge.distance,
          duration: edge.duration,
          lineStyle: {
            width: Math.max(1, Math.min(10, edge.count / 2)),
            curveness: 0.3,
          },
        }
      })

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'edge') {
            return `<strong>${params.data.source} → ${params.data.target}</strong><br/>
                    <strong>Trips:</strong> ${params.data.count}<br/>
                    <strong>Distance:</strong> ${params.data.distance.toFixed(1)} nm<br/>
                    <strong>Duration:</strong> ${params.data.duration.toFixed(1)} hrs`
          }
          return `<strong>${params.data.name}</strong><br/><strong>Visits:</strong> ${params.data.value}`
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links,
          roam: true,
          draggable: true,
          force: {
            repulsion: 200,
            gravity: 0.1,
            edgeLength: [100, 200],
            layoutAnimation: true,
          },
          label: {
            show: props.showLabels,
            position: 'right',
            formatter: '{b}',
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3,
            opacity: 0.6,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 4 },
          },
        },
      ],
    }
  })
</script>

<template>
  <div class="graph-chart">
    <VChart :option="chartOptions" :theme="theme" autoresize />
  </div>
</template>

<style scoped>
  .graph-chart {
    width: 100%;
    height: 600px;
    min-height: 400px;
  }
</style>
