export default {
  methods: {
    speedFormat(val, trad = 'logs.log.speed_knots') {
      if (!val) return null
      const n = parseFloat(val)
      const count = { n: n % 1 ? parseFloat(n.toFixed(2)) : n }
      return this.$t(trad, count)
    },
  },
}
