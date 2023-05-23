import { format } from 'date-fns'
import moment from 'moment/min/moment-with-locales'
import i18n from '../i18n/index.ts'

const { t } = i18n.global

export const dateFormat = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return format(date, 'Pp')
}
export const durationFormat = (durationString) => {
  /*
  const [ hours, minutes, seconds ] = durationString.split(':')
  const duration = { hours, minutes, seconds }
  return formatDuration(duration, { format: ['hours', 'minutes'] })
  */
  return durationString
}
export const dateFormatUTC = (dateString, local = 'en') => {
  if (!dateString) return null
  const date = moment.utc(dateString).locale(local).format('L LT')
  return date
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

export const durationFormatDays = (durationString) => {
  return moment.duration(durationString).as('days').toFixed(2)
}
