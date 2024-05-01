import i18n from '../i18n/index.ts'
const { t } = i18n.global

export function speedFormat(val) {
  return parseFloat(val).toFixed(1)
}

export const speedFormatKnots = (val, trad = 'logs.log.speed_knots') => {
  if (!val) return null
  const n = parseFloat(val)
  const count = { n: n % 1 ? parseFloat(n.toFixed(1)) : n }
  //console.log(count)
  if (count.n < 2) {
    count.n = 1
  }
  return t(trad, count)
}
