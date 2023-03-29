<template>
  <div class="overview-tab pt-2 layout">
    <div class="va-table-responsive">
      <table class="va-table va-table--striped va-table--hoverable">
        <tbody>
          <tr>
            <td>{{ t('profile.name') }}</td>
            <td style="font-weight: 600">{{ fullName }}</td>
          </tr>
          <tr>
            <td>{{ t('profile.preferred_homepage') }}</td>
            <td class="centerContainer">
              <va-select
                v-model="settings.preferences.preferred_homepage"
                :options="homepage_options"
                text-by="description"
                track-by="id"
                placeholder="Dashboard"
                :value-by="(option) => option.id"
                outline
                @click="log('homepage_options click', $event)"
                @focusout="UpdatePref('preferred_homepage', settings.preferences.preferred_homepage)"
              />
            </td>
          </tr>
          <tr>
            <td>{{ t('profile.use_imperial_units') }}</td>
            <td class="centerContainer">
              <va-switch
                v-model="settings.preferences.use_imperial_units"
                size="small"
                outline
                @click="UpdatePref('use_imperial_units', settings.preferences.use_imperial_units)"
              />
            </td>
          </tr>
          <tr>
            <td>{{ t('profile.website') }}</td>
            <td class="centerContainer">
              <va-input
                v-model="settings.preferences.website"
                outline
                @focusout="UpdatePref('website', settings.preferences.website)"
              />
            </td>
          </tr>
          <tr>
            <td>{{ t('profile.instagram_handle') }}</td>
            <td class="centerContainer">
              <va-input
                v-model="settings.preferences.instagram_handle"
                outline
                @focusout="UpdatePref('instagram_handle', settings.preferences.instagram_handle)"
              />
            </td>
          </tr>
          <tr>
            <td>{{ t('profile.public_profile') }}</td>
            <td class="centerContainer">
              <va-switch
                v-model="settings.preferences.public_profile"
                size="small"
                outline
                @click="UpdatePref('public_profile', settings.preferences.public_profile)"
              />
            </td>
          </tr>
          <template v-if="settings.preferences.public_profile">
            <tr class="sub-setting">
              <td>{{ t('profile.public_stats') }}</td>
              <td class="centerContainer">
                <va-switch
                  v-model="settings.preferences.public_stats"
                  size="small"
                  outline
                  @click="UpdatePref('public_stats', settings.preferences.public_stats)"
                />
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.public_timelapse') }}</td>
              <td class="centerContainer">
                <va-switch
                  v-model="settings.preferences.public_timelapse"
                  size="small"
                  outline
                  @click="UpdatePref('public_timelapse', settings.preferences.public_timelapse)"
                />
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.public_logs_list') }}</td>
              <td class="centerContainer">
                <va-switch
                  v-model="settings.preferences.public_logs_list"
                  size="small"
                  outline
                  @click="UpdatePref('public_logs_list', settings.preferences.public_logs_list)"
                />
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.public_logs') }}</td>
              <td class="centerContainer">
                <va-switch
                  v-model="settings.preferences.public_logs"
                  size="small"
                  outline
                  @click="UpdatePref('public_logs', settings.preferences.public_logs)"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { useI18n } from 'vue-i18n'
  import { ref, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import settingsData from '../../data/settings.json'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore

  const homepage_options = ref([
    {
      id: 1,
      description: 'Dashboard',
    },
    {
      id: 2,
      description: 'Ship Logs',
    },
    {
      id: 3,
      description: 'Monitoring',
    },
    {
      id: 4,
      description: 'Statistics',
    },
  ])
  // TODO should be computed?
  console.log(`First Last: ${settings.value.first} ${settings.value.last}`)
  const fullName = ref(`${settings.value.first} ${settings.value.last}`)
  // TODO Issue getting default value as per store setup
  onBeforeMount(async () => {
    console.log(`onBeforeMount Overviewtab`)
    await fetchSettings()
    console.log('OverviewTab onBeforeMount', `${settings.value.first} ${settings.value.last}`)
  })

  //const UpdatePref = async (key: string, value: any) => {
  const UpdatePref = async (key, value) => {
    if (!key || typeof value == 'undefined') {
      return
    }
    console.debug('OverviewTab UpdatePref', `Updating ${key}:${value}`)
    // Update GlobalStore should be automatic maybe need to use reactive()
    // API Call api.update_user_preferences({ key: ${key}, value: ${value} }) from the store
    const response = await updatePref(key, value)
    // Notify user on success or failure using va-toast.
    initToast({
      message: `${response ? 'Successfully updated' : 'Error updating'} ${key} with ${value}`,
      position: 'top-right',
      color: 'primary',
      //color: response.ok ? 'success' : 'warning',
    })
  }

  const log = console.debug
</script>
