<template>
  <div class="flex flex-col space-y-4">
    <!-- Account Information -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.information') }}</h3>
      <div class="flex flex-col space-y-3">
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs va-text-secondary uppercase tracking-wide">{{ t('profile.name') }}</span>
          <span class="text-regularMedium font-semibold">{{ fullName }}</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs va-text-secondary uppercase tracking-wide">Email</span>
          <span class="text-regularMedium font-semibold">{{ settings.email }}</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs va-text-secondary uppercase tracking-wide">{{ t('profile.member_since') }}</span>
          <span class="text-regularMedium font-semibold">{{ memberSince }}</span>
        </div>
      </div>

      <div class="flex flex-col space-y-1 pt-2">
        <span class="text-xs va-text-secondary uppercase tracking-wide">{{ t('profile.sponsor') }}</span>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.sponsor_thank_you') }}</p>
        <a href="https://github.com/sponsors/xbgmsharp" target="_blank" class="va-link link text-sm">
          Sponsor PostgSail on GitHub ↗
        </a>
      </div>
    </div>

    <!-- General Preferences -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.general_preferences') }}</h3>

      <!-- Language -->
      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.language') }}</label>
          <va-select
            v-model="selectedLanguage"
            :options="languageOptions"
            text-by="label"
            value-by="code"
            outline
            class="w-48"
            @update:modelValue="updateLanguage"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.language') }}</p>
      </div>

      <!-- Theme -->
      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.theme.title') }}</label>
          <va-button-toggle
            v-model="selectedTheme"
            :options="themeOptions"
            outline
            size="small"
            @update:modelValue="updateTheme"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.theme') }}</p>
      </div>

      <!-- Preferred Homepage -->
      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.preferred_homepage') }}</label>
          <va-select
            v-model="settings.preferences.preferred_homepage"
            :options="homepage_options"
            text-by="text"
            value-by="value"
            outline
            class="w-48"
            @update:modelValue="UpdatePref('preferred_homepage', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.preferred_homepage') }}</p>
      </div>

      <!-- Imperial Units -->
      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.use_imperial_units') }}</label>
          <va-switch
            v-model="settings.preferences.use_imperial_units"
            size="small"
            outline
            @update:modelValue="UpdatePref('use_imperial_units', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.use_imperial_units') }}</p>
      </div>

      <!-- Website -->
      <div class="flex flex-col space-y-1">
        <label class="text-regularMedium font-semibold">{{ t('profile.website') }}</label>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.website') }}</p>
        <VaInput
          v-model="settings.preferences.website"
          outline
          placeholder="(e.g. https://openplotter.cloud)"
          @change="UpdatePref('website', settings.preferences.website)"
        />
      </div>

      <!-- Instagram Handle -->
      <div class="flex flex-col space-y-1">
        <label class="text-regularMedium font-semibold">{{ t('profile.instagram_handle') }}</label>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.instagram_handle') }}</p>
        <VaInput
          v-model="settings.preferences.instagram_handle"
          outline
          placeholder="(e.g. @postgsail)"
          @change="UpdatePref('instagram_handle', settings.preferences.instagram_handle)"
        />
      </div>

      <!-- Windy Station -->
      <div class="flex flex-col space-y-1">
        <label class="text-regularMedium font-semibold">{{ t('profile.windy_station') }}</label>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.windy_station') }}</p>
        <VaInput
          v-model="settings.preferences.windy"
          outline
          placeholder="(e.g. d06efc48)"
          @change="UpdatePref('windy', settings.preferences.windy)"
        />
      </div>
    </div>

    <!-- Danger zone -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3" style="color: var(--va-danger)">{{ t('profile.delete_account') }}</h3>
      <p class="text-sm va-text-secondary">
        This will permanently delete all your data and account. This action cannot be undone.
      </p>
      <div>
        <va-button color="danger" icon="delete" @click="handleDelete">
          {{ t('profile.delete_account') }}
        </va-button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { ref, computed, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useToast, useModal, useColors } from 'vuestic-ui'
  import { useRouter } from 'vue-router'
  import PostgSail from '../../services/api-client'

  const { t, locale } = useI18n()
  const { init: initToast } = useToast()
  const { confirm } = useModal()
  const { applyPreset, currentPresetName } = useColors()
  const GlobalStore = useGlobalStore()
  const { settings, currentTheme, language } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore
  const router = useRouter()

  // ── Account Info ────────────────────────────────────────────────────────────

  const fullName = computed(() => [settings.value.first, settings.value.last].filter(Boolean).join(' ') || '—')

  const memberSince = computed(() => {
    if (!settings.value.created_at) return '—'
    return new Date(settings.value.created_at).toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // ── Language ─────────────────────────────────────────────────────────────────

  const languageOptions = [
    { code: 'gb', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'br', label: 'Brazilian Portuguese' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
  ]

  const selectedLanguage = ref(language.value || 'gb')

  const updateLanguage = (code) => {
    locale.value = code
    GlobalStore.$state.language = code
    language.value = code
    UpdatePref('language', code)
  }

  // ── Theme ────────────────────────────────────────────────────────────────────

  const themeOptions = [
    { value: 'light', label: t('profile.theme.light') },
    { value: 'dark', label: t('profile.theme.dark') },
    { value: 'auto', label: t('profile.theme.auto') },
  ]

  const selectedTheme = ref(currentTheme.value || currentPresetName.value || 'light')

  const updateTheme = (preset) => {
    selectedTheme.value = preset
    currentTheme.value = preset
    const resolved =
      preset === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preset
    applyPreset(resolved)
    const isDark = resolved === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    const panel = document.getElementById('sidepanel')
    panel?.classList.toggle('sidepanel-dark', isDark)
  }

  // ── Homepage & Preferences ───────────────────────────────────────────────────

  const homepage_options = [
    { value: 0, text: 'Dashboard' },
    { value: 1, text: 'Ship Logs' },
    { value: 2, text: 'Monitoring' },
    { value: 3, text: 'Statistics' },
    { value: 4, text: 'Map Explorer' },
  ]

  onBeforeMount(async () => {
    await fetchSettings()
    // Sync language selector with store after settings load
    selectedLanguage.value = language.value || 'gb'
  })

  const UpdatePref = async (key, value) => {
    if (!key || typeof value === 'undefined') return
    const response = await updatePref(key, value)
    initToast({
      message: response ? 'Successfully updated' : 'Error updating',
      position: 'top-right',
      color: response ? 'success' : 'warning',
    })
  }

  // ── Delete Account ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    const ok = await confirm({
      message: 'This will permanently delete all my data and account. Do you really want to continue?',
      title: 'Are you sure?',
      okText: 'Yes, I agree',
      cancelText: 'No, keep my data',
    })
    if (!ok) return
    const api = new PostgSail()
    try {
      const response = await api.account_delete()
      if (response) {
        initToast({ message: 'Successfully deleted account', position: 'top-right', color: 'success' })
        router.push({ name: 'logout' })
      }
    } catch {
      initToast({ message: 'Error deleting account', position: 'top-right', color: 'warning' })
    }
  }
</script>
