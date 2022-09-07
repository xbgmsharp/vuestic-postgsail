import { format } from 'date-fns'
export const dateFormat = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString.includes('Z') ? dateString : dateString + 'Z')
  console.log(dateString, date)
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
