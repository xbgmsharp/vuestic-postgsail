<template>
  <div class="flex flex-col space-y-6 md:space-y-4">
    <!-- Profile Information Section 
        <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg"
            style="background: rgb(255, 255, 255); color: rgb(38, 40, 36); --va-stripe-color-computed: #154ec1">
            <h3 class="h3">{{ t('profile.information') }}</h3>

            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <label class="text-regularMedium">{{ t('profile.name') }}</label>
                <span class="font-semibold">{{ fullName }}</span>
            </div>

            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <label class="text-regularMedium">{{ t('auth.email') }}</label>
                <span class="font-semibold">{{ settings.email }}</span>
            </div>

            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <label class="text-regularMedium">{{ t('profile.member_since') }}</label>
                <span class="font-semibold">{{ MemberSince }}</span>
            </div>
        </div>
        -->

    <!-- Profile Information Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.information') }}</h3>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('profile.name') }}</label>
        <span class="font-semibold">{{ fullName }}</span>
      </div>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('auth.email') }}</label>
        <span class="font-semibold">{{ settings.email }}</span>
      </div>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('profile.member_since') }}</label>
        <span class="font-semibold">{{ MemberSince }}</span>
      </div>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('profile.sponsor') }}</label>
        <!--
                <span class="font-semibold">{{ settings.preferences.is_sponsor }}</span>
            -->
        <template v-if="settings.preferences.is_sponsor">
          <span class="font-semibold">{{ t('profile.msg.sponsor_thank_you') }}</span>
        </template>
        <template v-else>
          <VaIcon name="check_circle" color="warning" />
          <a href="https://github.com/sponsors/xbgmsharp" target="_blank">
            <va-button color="success" icon="sponsor" target="_blank"> Sponsor on GitHub </va-button></a
          >
        </template>
      </div>
    </div>

    <!-- General Preferences Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.general_preferences') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.language') }}</label>
          <va-select v-model="languageModel" :options="languageOptions" outline class="w-full md:w-64" />
        </div>
        <p class="text-sm">{{ $t('profile.msg.language') }}</p>
      </div>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.theme.title') }}</label>
          <va-select
            v-model="themeModel"
            :options="themeOptions"
            outline
            class="w-full md:w-64"
            track-by="value"
            value-by="value"
            text-by="label"
            @update:modelValue="handleThemeChange"
          />
        </div>
        <p class="text-sm">{{ $t('profile.msg.theme') }}</p>
      </div>

      <div class="flex flex-col space-y-2">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-4">
          <label class="text-regularMedium font-semibold mb-2 md:mb-0">{{ t('profile.preferred_homepage') }}</label>
          <va-select
            v-model="settings.preferences.preferred_homepage"
            :options="homepage_options"
            outline
            class="flex-shrink-0 w-full md:w-64"
            value-by="value"
            text-by="text"
            @update:modelValue="UpdatePref('preferred_homepage', $event)"
          />
        </div>
        <p class="text-sm">{{ $t('profile.msg.preferred_homepage') }}</p>
      </div>

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
        <p class="text-sm">{{ $t('profile.msg.use_imperial_units') }}</p>
      </div>
    </div>

    <!-- Social & External Links Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.social_links') }}</h3>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('profile.website') }}</label>
        <p class="text-sm">{{ $t('profile.msg.website') }}</p>
        <VaInput
          v-model="localpref.website"
          outline
          placeholder="(e.g. https://openplotter.cloud)"
          @change="UpdatePref('website', settings.preferences.website)"
        />
      </div>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('profile.instagram_handle') }}</label>
        <p class="text-sm">{{ $t('profile.msg.instagram_handle') }}</p>
        <va-input
          v-model="localpref.instagram_handle"
          outline
          placeholder="(e.g. @postgsail)"
          @change="UpdatePref('instagram_handle', settings.preferences.instagram_handle)"
        />
      </div>

      <div class="flex flex-col space-y-2">
        <label class="text-regularMedium font-semibold">{{ t('profile.windy_station') }}</label>
        <p class="text-sm">{{ $t('profile.msg.windy_station') }}</p>
        <VaInput
          v-model="localpref.windy"
          outline
          placeholder="(e.g. d06efc48)"
          @change="UpdatePref('windy', settings.preferences.windy)"
        />
      </div>
    </div>

    <!-- Public Profile Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.public_profile') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.public_profile') }}</label>
          <va-switch
            v-model="settings.preferences.public_profile"
            size="small"
            outline
            @update:modelValue="UpdatePref('public_profile', $event)"
          />
        </div>
        <p class="text-sm">{{ $t('profile.msg.public_profile', [fullVesselName]) }}</p>
      </div>

      <!-- Public Profile Sub-settings -->
      <template v-if="settings.preferences.public_profile">
        <VaAlert class="rounded-lg p-4 m-0" color="info">
          <template #icon>
            <VaIcon size="24px" name="public" />
          </template>
          <div class="flex flex-col space-y-2">
            <p class="text-regularLarge font-bold">{{ t('profile.public_profile_enabled') }}</p>
            <p class="text-regularMedium">{{ t('profile.msg.public_profile_info') }}</p>
          </div>
        </VaAlert>

        <div class="flex flex-col space-y-6 pl-4 border-l-2 border-primary">
          <!-- Public Vessel Name -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.public_name') }}</label>
            <p class="text-sm">{{ $t('profile.msg.public_name', [fullVesselName]) }}</p>

            <div class="flex gap-2">
              <va-select
                v-model="vesselPrefix"
                :options="vesselOptions"
                track-by="value"
                value-by="value"
                text-by="description"
                outline
                class="w-full md:w-64"
                @update:modelValue="updateVesselName"
              />
              <VaInput
                v-model.trim="vesselName"
                outline
                class="flex-grow"
                placeholder="Enter vessel name"
                :rules="[(v) => v.length > 3 || 'Vessel name must be at least 3 characters']"
                @change="updateVesselName"
              />
            </div>
            <p v-if="error_vessel" class="text-danger text-sm">{{ error_vessel }}</p>
            <p class="text-xs">
              Full name: <span class="font-semibold">{{ vesselPrefix }} {{ vesselName }}</span>
            </p>
          </div>

          <!-- Public Password Protected -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.password_protected') }}</label>
              <va-switch
                v-model="settings.preferences.public_password_protected"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_password_protected', $event)"
              />
            </div>
            <p class="text-sm">
              {{ $t('profile.msg.password_protected') }}
            </p>

            <!-- Password Input (shown only when toggle is enabled) -->
            <template v-if="settings.preferences.public_password_protected">
              <div class="flex flex-col space-y-2 pl-4 border-l-2 border-primary pt-2">
                <label class="text-sm font-semibold">{{ t('profile.set_password') }}</label>
                <VaInput
                  v-model.trim="localpref.public_password"
                  :type="showPassword ? 'text' : 'password'"
                  outline
                  placeholder="Enter password (min. 6 characters)"
                  :rules="[(v) => !v || v.length >= 6 || 'Password must be at least 6 characters']"
                  @change="UpdatePref('public_password', localpref.public_password)"
                >
                  <template #appendInner>
                    <VaIcon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      size="small"
                      color="secondary"
                      class="cursor-pointer"
                      @click.stop="showPassword = !showPassword"
                    />
                  </template>
                </VaInput>
              </div>
            </template>
          </div>

          <!-- Public Stats -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_stats') }}</label>
              <va-switch
                v-model="settings.preferences.public_stats"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_stats', $event)"
              />
            </div>
            <p class="text-sm">{{ $t('profile.msg.public_stats', [fullVesselName]) }}</p>
            <a :href="$t('profile.url.public_stats', [fullVesselName])" target="_blank" class="va-link link text-sm">
              {{ $t('profile.url.public_stats', [fullVesselName]) }}
            </a>
          </div>

          <!-- Public Timelapse -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_timelapse') }}</label>
              <va-switch
                v-model="settings.preferences.public_timelapse"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_timelapse', $event)"
              />
            </div>
            <p class="text-sm">{{ $t('profile.msg.public_timelapse', [fullVesselName]) }}</p>
            <a
              :href="$t('profile.url.public_timelapse', [fullVesselName])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_timelapse', [fullVesselName]) }}
            </a>
          </div>

          <!-- Public Logs List -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_logs_list') }}</label>
              <va-switch
                v-model="settings.preferences.public_logs_list"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_logs_list', $event)"
              />
            </div>
            <p class="text-sm">{{ $t('profile.msg.public_logs_list', [fullVesselName]) }}</p>
            <a
              :href="$t('profile.url.public_logs_list', [fullVesselName])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_logs_list', [fullVesselName]) }}
            </a>
          </div>

          <!-- Public Logs -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_logs') }}</label>
              <va-switch
                v-model="settings.preferences.public_logs"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_logs', $event)"
              />
            </div>
            <p class="text-sm">{{ $t('profile.msg.public_logs', [fullVesselName, '{id}']) }}</p>
            <span class="text-sm">
              {{ $t('profile.url.public_logs', [fullVesselName, '{id}']) }}
            </span>
          </div>

          <!-- Public Monitoring -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_monitoring') }}</label>
              <va-switch
                v-model="settings.preferences.public_monitoring"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_monitoring', $event)"
              />
            </div>
            <p class="text-sm">{{ $t('profile.msg.public_monitoring', [fullVesselName]) }}</p>
            <a
              :href="$t('profile.url.public_monitoring', [fullVesselName])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_monitoring', [fullVesselName]) }}
            </a>
          </div>

          <!-- Public Windy -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.windy_station') }}</label>
              <va-switch
                v-model="settings.preferences.public_windy"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_windy', $event)"
              />
            </div>
            <p class="text-sm">{{ $t('profile.msg.public_windy') }}</p>
            <template v-if="settings.preferences.windy">
              <a
                :href="$t('profile.url.public_windy', [settings.preferences.windy])"
                target="_blank"
                class="va-link link text-sm"
              >
                {{ $t('profile.url.public_windy', [settings.preferences.windy]) }}
              </a>
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- MCP Integration Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.mcp_integration') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.mcp_integration') }}</label>
          <GetMCPToken />
        </div>
        <p class="text-sm">{{ $t('profile.msg.mcp_integration') }}</p>
        <a href="https://github.com/xbgmsharp/postgsail-mcp-server" target="_blank" class="va-link link text-sm">
          PostgSail Model Context Protocol (MCP) Server
        </a>
      </div>
    </div>

    <div class="flex flex-col p-4 space-y-4 rounded-lg">
      <va-button size="medium" icon="delete" color="danger" style="width: 100%" @click="handleDelete">{{
        $t('profile.delete_account')
      }}</va-button>
    </div>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { useI18n } from 'vue-i18n'
  import { ref, computed, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useModal, useToast, useColors } from 'vuestic-ui'
  import GetMCPToken from '../profile/GetMCPToken.vue'
  import { useRouter } from 'vue-router'
  import PostgSail from '../../services/api-client'

  const { t, locale } = useI18n()
  const { init: initToast } = useToast()
  const { confirm } = useModal()
  const { applyPreset, currentPresetName } = useColors()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore
  const router = useRouter()
  const isBusy = ref(false)
  const apiError = ref(null)
  const error_vessel = ref('')
  const localpref = ref({})

  const homepage_options = ref([
    {
      value: 0,
      text: 'Dashboard',
    },
    {
      value: 1,
      text: 'Ship Logs',
    },
    {
      value: 2,
      text: 'Monitoring',
    },
    {
      value: 3,
      text: 'Statistics',
    },
    {
      value: 4,
      text: 'Map Explorer',
    },
  ])

  console.debug(`First Last: ${settings.value.first} ${settings.value.last}`)
  const fullName = ref(`${settings.value.first} ${settings.value.last}`)

  /* language */
  const languages = {
    english: 'English',
    spanish: 'Spanish',
    brazilian_portuguese: 'Português',
    french: 'French',
    german: 'German',
  }
  const languageCodes = {
    gb: languages.english,
    es: languages.spanish,
    br: languages.brazilian_portuguese,
    fr: languages.french,
    de: languages.german,
  }
  const languageName = Object.fromEntries(Object.entries(languageCodes).map(([key, value]) => [value, key]))
  const languageOptions = Object.values(languageCodes)
  const languageModel = computed({
    get() {
      return languageCodes[locale.value]
    },
    set(value) {
      locale.value = languageName[value]
      UpdatePref('language', locale.value)
    },
  })

  /* Theme */
  const themeOptions = [
    { label: t('profile.theme.dark'), value: 'dark' },
    { label: t('profile.theme.light'), value: 'light' },
    { label: t('profile.theme.auto'), value: 'auto' },
  ]
  const themeModel = ref(settings.value.preferences?.theme || 'auto')
  // Get system theme
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  // Apply theme
  const applyThemePreference = (preference) => {
    const actualTheme = preference === 'auto' ? getSystemTheme() : preference
    applyPreset(actualTheme)
  }
  // Handle theme change
  const handleThemeChange = (value) => {
    themeModel.value = value
    applyThemePreference(value)
    updatePref('theme', value)
  }

  /* Vessel */
  const vesselOptions = ref([
    { value: 'SV', text: 'SV', description: 'SV - Sailing Vessel' },
    { value: 'MV', text: 'MV', description: 'MV - Motor Vessel' },
    { value: 'SY', text: 'SY', description: 'SY - Sailing Yacht' },
    { value: 'MY', text: 'MY', description: 'MY - Motor Yacht' },
  ])
  const vesselPrefix = ref('SV')
  const vesselName = ref('')

  // Computed property for full vessel name (no spaces)
  const fullVesselName = computed(() => {
    const name = vesselName.value.replace(/\s+/g, '') // Remove all spaces
    return `${vesselPrefix.value}${name}`
  })

  // Get current prefix description
  const vesselPrefixDescription = computed(() => {
    const option = vesselOptions.value.find((opt) => opt.value === vesselPrefix.value)
    return option ? option.description : ''
  })

  // Initialize vessel name parts
  const initVesselName = () => {
    if (settings.value.public_vessel) {
      const vessel = settings.value.public_vessel.trim()
      // Extract prefix (first 2-3 uppercase letters)
      const prefixMatch = vessel.match(/^([A-Z]{2})/)
      if (prefixMatch) {
        vesselPrefix.value = prefixMatch[1]
        vesselName.value = vessel.slice(prefixMatch[1].length)
      } else {
        vesselName.value = vessel
      }
    }
  }

  // Update combined vessel name
  const updateVesselName = () => {
    const fullName = fullVesselName.value
    localpref.value.public_vessel = fullName

    // Validate
    const regex = /^[A-Z]{2,3}[\w]{3,15}$/
    if (!regex.test(fullName) && fullName.length > 0) {
      error_vessel.value = 'Format: Prefix + Name (e.g., "SVSerenity"). Only alphanumeric, no spaces.'
      return
    }
    error_vessel.value = ''

    // Update settings.public_vessel for reactive updates
    settings.value.public_vessel = fullName

    // Save to preferences
    UpdatePref('public_vessel', fullName)
  }

  const showPassword = ref(false)

  const MemberSince = computed(() => {
    if (!settings.value.created_at) return ''
    const date = new Date(settings.value.created_at)
    return date.toLocaleDateString(languageCodes[locale.value], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  onBeforeMount(async () => {
    console.log(`onBeforeMount Overviewtab`)
    await fetchSettings()
    console.log(
      'OverviewTab onBeforeMount',
      `${settings.value.first} ${settings.value.last} ${settings.value.preferences.public_vessel}`,
      settings.value,
    )
    localpref.value = GlobalStore.settings.preferences
    initVesselName()
  })

  const UpdatePref = async (key, value) => {
    if (!key || typeof value == 'undefined') return
    console.debug('OverviewTab UpdatePref', `Updating ${key}: ${value}`)

    const regex = /^\w{3,15}$/
    if (key == 'public_vessel' && !regex.test(value)) {
      error_vessel.value = 'Only alphanumeric (letters, numbers, regardless of case) plus underscore (_)'
      return
    }
    error_vessel.value = ''

    const response = await updatePref(key, value)

    initToast({
      message: `${response ? 'Successfully updated' : 'Error updating'} ${key} with ${value}`,
      position: 'top-right',
      color: 'primary',
    })
  }

  const handleDelete = async () => {
    console.log('handleDelete')
    isBusy.value = true
    apiError.value = null
    let canDelete = false

    const modal_result = await confirm({
      message: `This will permanently delete all my data and account. Do you really want to continue?`,
      title: 'Are you sure?',
      okText: 'Yes, I agree',
      cancelText: 'No, keep my data',
      //zIndex: -9999,
    })
    if (modal_result) {
      canDelete = true
    } else {
      isBusy.value = false
      initToast('Operation cancel')
    }

    if (!canDelete) return

    const api = new PostgSail()
    try {
      const response = await api.account_delete()
      if (response) {
        console.log('account_delete success', response)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('account_delete failed', response)
      apiError.value = response.message
    } finally {
      initToast({
        message: apiError.value ? `Error deleting account` : `Successfully deleted account`,
        position: 'top-right',
        color: apiError.value ? 'warning' : 'success',
      })
      isBusy.value = false
      router.push({ name: 'logout' })
    }
  }
</script>
