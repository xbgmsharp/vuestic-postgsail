import i18n from '../i18n/index.ts'

const { t, locale } = i18n.global

/*
 * Locale mapping — kept as-is. Intl accepts these tags case-insensitively.
 */
export const locale_mapping = { gb: 'en-gb', es: 'es', fr: 'fr', br: 'pt-br', de: 'de-de' }

function moment_locale() {
  return locale_mapping[locale.value] || 'en'
}

/* ------------------------------------------------------------------ *
 * Safe date parsing
 *
 * Guards against two failure modes:
 *  1. Genuinely invalid/unparseable input -> Invalid Date
 *  2. An ISO 8601 DURATION string (e.g. "PT2H30M") accidentally passed
 *     into a date function instead of a duration function. Dates and
 *     durations are both "ISO strings" but are not interchangeable —
 *     new Date("PT2H30M") silently produces an Invalid Date.
 * ------------------------------------------------------------------ */
const ISO_DURATION_PREFIX = /^P(?=\d|T)/ // starts with P followed by a digit or T

function toValidDate(dateInput) {
  if (!dateInput) return null

  if (typeof dateInput === 'string' && ISO_DURATION_PREFIX.test(dateInput)) {
    console.error(
      '[dateFormatter] Got an ISO duration string where a date was expected. ' +
        'Use durationHours/durationFormatHours/durationISOToHuman instead. Value:',
      dateInput,
    )
    return null
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  if (isNaN(date.getTime())) {
    console.warn('[dateFormatter] Invalid date input:', dateInput)
    return null
  }

  return date
}

/* ------------------------------------------------------------------ *
 * ISO 8601 DURATION parsing (e.g. "PT2H30M", "P1DT4H") — replaces
 * moment.duration(iso).as('hours'/'days')
 * ------------------------------------------------------------------ */
const ISO_DURATION_RE = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/

function parseISODurationSeconds(duration) {
  if (!duration) return 0
  const match = ISO_DURATION_RE.exec(duration)
  if (!match) {
    console.warn('[dateFormatter] Could not parse ISO duration:', duration)
    return 0
  }
  const [, days, hours, minutes, seconds] = match
  return (
    (Number(days) || 0) * 86400 + (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0)
  )
}

/* ------------------------------------------------------------------ *
 * Moment-style format token replacement — SINGLE PASS
 *
 * Bug fixed: the original implementation chained sequential .replace()
 * calls on the accumulating string. Each call re-scanned the entire
 * output, so tokens like "A" (AM/PM) and "M" (month digit) would fire
 * again inside locale strings already emitted by earlier replacements.
 *
 * Concrete failure: "ll LT" in fr locale produced "8 pmoût 2025 16:48"
 * because the "A" token matched the capital A inside "août" (the French
 * month name emitted by the "ll" replacement) and replaced it with "pm".
 *
 * Fix: build a single regex that matches ALL tokens at once, ordered
 * longest-first to prevent partial collisions, then replace each match
 * exactly once via a lookup function. The output string is never
 * re-scanned, so substituted locale text is safe.
 * ------------------------------------------------------------------ */

// Token order: longest / most-specific first to avoid partial collisions.
// Each entry: [tokenString, resolver(date, localeStr)]
function buildTokenResolvers(date, localeStr) {
  const pad = (n) => String(n).padStart(2, '0')
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const H = date.getHours()
  const h12 = H % 12 === 0 ? 12 : H % 12
  const m = date.getMinutes()
  const s = date.getSeconds()
  const ampm = H < 12 ? 'AM' : 'PM'

  return {
    LLLL: new Intl.DateTimeFormat(localeStr, { dateStyle: 'full' }).format(date),
    LLL: new Intl.DateTimeFormat(localeStr, { dateStyle: 'long', timeStyle: 'short' }).format(date),
    LL: new Intl.DateTimeFormat(localeStr, { dateStyle: 'long' }).format(date),
    ll: new Intl.DateTimeFormat(localeStr, { dateStyle: 'medium' }).format(date),
    LTS: new Intl.DateTimeFormat(localeStr, { timeStyle: 'medium' }).format(date),
    LT: new Intl.DateTimeFormat(localeStr, { timeStyle: 'short' }).format(date),
    L: new Intl.DateTimeFormat(localeStr, { dateStyle: 'short' }).format(date),
    YYYY: String(Y),
    YY: String(Y).slice(-2),
    MMMM: new Intl.DateTimeFormat(localeStr, { month: 'long' }).format(date),
    MMM: new Intl.DateTimeFormat(localeStr, { month: 'short' }).format(date),
    MM: pad(M),
    dddd: new Intl.DateTimeFormat(localeStr, { weekday: 'long' }).format(date),
    ddd: new Intl.DateTimeFormat(localeStr, { weekday: 'short' }).format(date),
    DD: pad(D),
    HH: pad(H),
    hh: pad(h12),
    mm: pad(m),
    ss: pad(s),
    A: ampm,
    a: ampm.toLowerCase(),
    // Single-char tokens last — word-boundary match only, handled via regex group
    M: String(M),
    D: String(D),
    H: String(H),
    h: String(h12),
  }
}

// Tokens that should only match on a word boundary (single-letter numeric tokens)
// to avoid matching inside longer words.
const WORD_BOUNDARY_TOKENS = new Set(['M', 'D', 'H', 'h'])

function formatWithPattern(date, pattern, localeStr) {
  const resolvers = buildTokenResolvers(date, localeStr)

  // Build one regex matching all tokens, longest first.
  // Single-letter numeric tokens use word boundaries (\b) so they don't
  // fire inside already-substituted locale text (which is never re-scanned
  // anyway in a single-pass replace, but the boundary keeps intent clear).
  const tokenPattern = Object.keys(resolvers)
    .map(
      (token) => (WORD_BOUNDARY_TOKENS.has(token) ? `\\b${token}\\b` : token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), // escape special chars
    )
    .join('|')

  const regex = new RegExp(tokenPattern, 'g')

  return pattern.replace(regex, (match) => resolvers[match] ?? match)
}

/* ------------------------------------------------------------------ *
 * fromNow() via Intl.RelativeTimeFormat — replaces moment().fromNow()
 * ------------------------------------------------------------------ */
const RTF_DIVISIONS = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
]

function formatRelative(diffMs, localeStr) {
  const rtf = new Intl.RelativeTimeFormat(localeStr, { numeric: 'auto' })
  let duration = diffMs / 1000
  for (const division of RTF_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return rtf.format(Math.round(duration), 'years')
}

/* ------------------------------------------------------------------ *
 * Public API — same exports/signatures as the original moment version
 * ------------------------------------------------------------------ */

export const fromNow = (dateString) => {
  const date = toValidDate(dateString)
  if (!date) return null
  return formatRelative(date.getTime() - Date.now(), moment_locale())
}

export const dateFormat = (dateString) => {
  const date = toValidDate(dateString)
  if (!date) return null
  return new Intl.DateTimeFormat(moment_locale(), { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export const durationFormat = (durationString) => {
  // Kept as no-op passthrough, matching original (unused) behavior
  return durationString
}

export const dateFormatUTC = (dateString, format = 'll LT') => {
  const date = toValidDate(dateString)
  if (!date) return null
  return formatWithPattern(date, format, moment_locale())
}

export const dateFormatTime = (dateString) => {
  const date = toValidDate(dateString)
  if (!date) return null
  return new Intl.DateTimeFormat(moment_locale(), { timeStyle: 'short' }).format(date)
}

export function localTime() {
  return new Intl.DateTimeFormat(moment_locale(), { timeStyle: 'short' }).format(new Date())
}

export function nowUTC() {
  return new Date().toISOString()
}

export const durationHours = (durationString) => {
  return parseISODurationSeconds(durationString) / 3600
}

export const durationFormatHours = (durationString) => {
  return durationHours(durationString).toFixed(1)
}

export const durationI18nHours = (durationString, tr = 'units.time.hours') => {
  const durationH = durationHours(durationString)
  return t(tr, durationH === 1 ? 0 : parseInt(durationH))
}

export const durationDays = (durationString) => {
  return parseISODurationSeconds(durationString) / 86400
}

export const durationFormatDays = (durationString) => {
  return durationDays(durationString).toFixed(1)
}

export const durationI18nDays = (durationString, tr = 'units.time.days') => {
  const durationD = parseFloat(durationFormatDays(durationString))
  return t(tr, durationD)
}

export const stayGeneratedName = (duration, moorage, departed) => {
  const days = durationDays(duration)
  let durationLabel
  if (days >= 1) {
    durationLabel = t('units.time.days', Math.round(days))
  } else {
    const hours = Math.round(durationHours(duration))
    durationLabel = hours + ' ' + t('units.time.hours', hours)
  }
  const departedDate = toValidDate(departed)
  const monthYear = departedDate
    ? new Intl.DateTimeFormat(moment_locale(), { month: 'long', year: 'numeric' }).format(departedDate)
    : ''
  return [durationLabel, moorage, monthYear].filter(Boolean).join(' · ')
}

export const durationI18nDaysHours = (durationString) => {
  const totalHours = durationHours(durationString)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours - days * 24
  let durationDH = ''
  if (days > 0) {
    durationDH += t('units.time.days', days) + ', '
  }
  durationDH += hours.toFixed(1) + ' ' + t('units.time.hours')
  return durationDH
}

export const durationFromNow = (timeString) => {
  const date = toValidDate(timeString)
  if (!date) return null
  return formatRelative(date.getTime() - Date.now(), moment_locale())
}

/**
 * Convert number of hours into human readable format
 * Example: 27.5 -> "1 day(s), 3.5 hour(s)"
 */
export const hoursToHuman = (hours) => {
  const days = Math.floor(hours / 24)
  const remHours = hours - days * 24
  let res = ''
  if (days > 0) res += `${days} day(s)`
  if (remHours > 0) res += (res ? ', ' : '') + `${remHours.toFixed(1)} hour(s)`
  if (!res) res = '0 hours'
  return res
}

/**
 * Convert a number of hours into a human readable format
 * Examples:
 *   27.5 -> "1 day 3 hours"
 *   2 -> "2 hours"
 *   0.5 -> "30 minutes"
 */
export const hoursToHumanMoment = (hours) => {
  const totalMinutes = Math.round(hours * 60)
  const days = Math.floor(totalMinutes / 1440)
  const hrs = Math.floor((totalMinutes % 1440) / 60)
  const mins = totalMinutes % 60

  const parts = []
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  if (hrs > 0) parts.push(`${hrs} hour${hrs !== 1 ? 's' : ''}`)
  if (mins > 0 && days === 0) parts.push(`${mins} minute${mins !== 1 ? 's' : ''}`)

  return parts.length > 0 ? parts.join(' ') : '0 hours'
}

export const durationFromTS = (start, end) => {
  const startDate = toValidDate(start)
  const endDate = toValidDate(end)
  if (!startDate || !endDate) return null
  const diffMs = Math.abs(startDate.getTime() - endDate.getTime())
  return hoursToHumanMoment(diffMs / 3600000)
}

/**
 * Convert an ISO 8601 DURATION string (e.g. "PT2H30M") into human-readable
 * format. Not in the original moment file under this name, but added since
 * durationFormat() was a no-op — use this when you need actual humanization
 * of a duration value (as opposed to a date).
 */
export const durationISOToHuman = (isoDuration) => {
  if (!isoDuration) return null
  return hoursToHumanMoment(durationHours(isoDuration))
}

export const toISODate = (value) => {
  const d = new Date(value)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
