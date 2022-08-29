export default {
  methods: {
    distanceFormat(val, trad = 'logs.log.distance_miles') {
      if (!val) return null
      const n = parseFloat(val)
      const count = { n: n % 1 ? parseFloat(n.toFixed(2)) : n }
      return this.$t(trad, count)
    },
  },
}
