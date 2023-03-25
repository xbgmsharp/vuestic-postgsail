import { format } from 'date-fns'
import moment from 'moment/min/moment-with-locales'

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
export const durationFormatHours = (durationString) => {
  return moment.duration(durationString).as('hours').toFixed(2)
}
export const durationFormatDays = (durationString) => {
  return moment.duration(durationString).as('days').toFixed(2)
}
