import i18n from '../i18n/index.ts'
const { t } = i18n.global
export const distanceFormat = (val, trad = 'logs.log.distance_miles') => {
  if (!val) return null
  const n = parseFloat(val)
  const count = { n: n % 1 ? parseFloat(n.toFixed(2)) : n }
  return t(trad, count)
}
