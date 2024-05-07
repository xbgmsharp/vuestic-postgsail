export function setAppTitle(title) {
  let appTitle = title ? title : ''
  if (import.meta.env.VITE_APP_TITLE) {
    appTitle += appTitle != '' ? ' - ' : ''
    appTitle += import.meta.env.VITE_APP_TITLE
  }
  if (import.meta.env.VITE_APP_HOSTNAME) {
    appTitle += appTitle != '' ? ' - ' : ''
    appTitle += import.meta.env.VITE_APP_HOSTNAME
  }
  return appTitle
}
