import { createI18n } from 'vue-i18n'

interface LocaleModule {
  default: Record<string, string>
}

const fileNameToLocaleModuleDict = import.meta.glob('./locales/*.json', { eager: true })

const messages: { [P: string]: Record<string, string> } = {}
Object.entries(fileNameToLocaleModuleDict).forEach(([fileName, localeModule]) => {
  const fileNameParts = fileName.split('/')
  const fileNameWithoutPath = fileNameParts[fileNameParts.length - 1]
  const localeName = fileNameWithoutPath.split('.json')[0]

  messages[localeName] = (localeModule as LocaleModule).default
})

export default createI18n({
  legacy: false,
  locale: 'gb',
  fallbackLocale: 'gb',
  globalInjection: true,
  messages,
  silentTranslationWarn: true, // https://github.com/intlify/bundle-tools/discussions/146
})
