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
  //const date = moment.utc(dateString).locale(moment_locale()).format('L LT')
  //const date = moment.utc(dateString).locale(moment_locale()).format(format)
  const date = new Date(dateString).toLocaleString()
  return date
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
  return durationHours(durationString).toFixed(2)
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
  // display "day" only if exactly 1; "hours" otherwise (e.g.: 0.8, 1.2):
  //return t(tr, durationHours(durationString) === '1' ? 1 : 0)
  // displaying "hour" vs "hours" delegated to Vue:
  //return t(tr, parseInt(durationHours(durationString)))
  // display "hour" up to and including 1 with gb.json "hour hours hours"
  const durationD = durationFormatDays(durationString)
  return t(tr, durationD === '1' ? 0 : parseInt(durationD))
}
