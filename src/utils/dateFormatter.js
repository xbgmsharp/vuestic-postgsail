import { format } from 'date-fns'
import moment from 'moment/min/moment-with-locales'
import i18n from '../i18n/index.ts'

const { t, locale } = i18n.global

/*
 * Moment locale mapping definition
 */
export const locale_mapping = { gb: 'en-gb', es: 'es', fr: 'fr', br: 'pt-br', de: 'de-de' }
function moment_locale() {
  return locale_mapping[locale.value] || 'en'
}

export const fromNow = (dateString) => {
  return moment.utc(dateString).locale(moment_locale()).fromNow()
}

export const dateFormat = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return format(date, 'Pp')
}
export const durationFormat = (durationString) => {
  // Duration need to be ISO format to be compatible with momentjs
  /*
  const [ hours, minutes, seconds ] = durationString.split(':')
  const duration = { hours, minutes, seconds }
  return formatDuration(duration, { format: ['hours', 'minutes'] })
  */
  return durationString
}
export const dateFormatUTC = (dateString, format = 'll LT') => {
  if (!dateString) return null
  return moment.utc(dateString).locale(moment_locale()).format(format)
}
export const dateFormatTime = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString).toLocaleTimeString()
  return date
}

export function localTime() {
  return moment().locale(moment_locale()).format('LT')
}

export function nowUTC() {
  return moment.utc()
}

export const durationHours = (durationString) => {
  return moment.duration(durationString).as('hours')
}
export const durationFormatHours = (durationString) => {
  return durationHours(durationString).toFixed(1)
}
export const durationI18nHours = (durationString, tr = 'units.time.hours') => {
  // display "hour" only if exactly 1; "hours" otherwise (e.g.: 0.8, 1.2):
  //return t(tr, durationHours(durationString) === '1' ? 1 : 0)
  // displaying "hour" vs "hours" delegated to Vue:
  //return t(tr, parseInt(durationHours(durationString)))
  // display "hour" up to and including 1 with gb.json "hour hours hours"
  const durationH = durationHours(durationString)
  return t(tr, durationH === '1' ? 0 : parseInt(durationH))
}

export const durationDays = (durationString) => {
  return moment.duration(durationString).as('days')
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
  const monthYear = departed ? moment.utc(departed).locale(moment_locale()).format('MMMM YYYY') : ''
  return [durationLabel, moorage, monthYear].filter(Boolean).join(' · ')
}

export const durationI18nDaysHours = (durationString) => {
  let days = Math.floor(moment.duration(durationString).as('days'))
  let hours = moment.duration(durationString).as('hours') - days * 24
  let durationDH = ''
  if (days > 0) {
    durationDH += t('units.time.days', days) + ', '
  }
  durationDH += hours.toFixed(1) + ' ' + t('units.time.hours')
  return durationDH
}

export const durationFromNow = (timeString) => {
  return durationI18nDaysHours(moment.utc(timeString).diff(moment.utc()))
}

/**
 * Convert number of hours into human readable format
 * Example: 27.5 -> "1 day, 3.5 hours"
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
 *   27.5 -> "1 day, 3 hours"
 *   2 -> "2 hours"
 *   0.5 -> "30 minutes"
 */
export const hoursToHumanMoment = (hours) => {
  const dur = moment.duration(hours, 'hours')

  const days = Math.floor(dur.asDays())
  const hrs = dur.hours()
  const mins = dur.minutes()

  const parts = []
  if (days > 0) parts.push(moment.duration(days, 'days').locale(moment_locale()).humanize())
  if (hrs > 0) parts.push(moment.duration(hrs, 'hours').locale(moment_locale()).humanize())
  if (mins > 0 && days === 0) parts.push(moment.duration(mins, 'minutes').locale(moment_locale()).humanize())

  return parts.length > 0 ? parts.join(' ') : moment.duration(0, 'hours').locale(moment_locale()).humanize()
}

export const durationFromTS = (start, end) => {
  return hoursToHumanMoment(moment.duration(moment.utc(start).diff(moment.utc(end))))
}
