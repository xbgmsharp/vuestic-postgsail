<template>
  <div class="overview-tab pt-2 layout">
    <div class="va-table-responsive">
      <table class="va-table full-table va-table--striped va-table--hoverable">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{{ fullName }}</td>
          </tr>
          <tr>
            <td>Preferred Homepage</td>
            <td>
              <div class="centerContainer">
                <va-select
                  v-model="settings.preferences.preferred_homepage"
                  :options="options"
                  placeholder="Ship Logs"
                  @change="
                    UpdatePref(
                      'preferred_homepage',
                      settings.preferences.preferred_homepage ? settings.preferences.preferred_homepage : '',
                    )
                  "
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Use Imperial Units</td>
            <td>
              <div class="centerContainer">
                <va-switch
                  v-model="settings.preferences.use_imperial_units"
                  size="small"
                  @click="UpdatePref('use_imperial_units', settings.preferences.use_imperial_units)"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Website</td>
            <td>
              <div class="centerContainer">
                <va-input
                  v-model="settings.preferences.website"
                  class="mb-6"
                  style=""
                  @focusout="UpdatePref('website', settings.preferences.website)"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Instagram Handle</td>
            <td>
              <div class="centerContainer">
                <va-input
                  v-model="settings.preferences.instagram_handle"
                  class="mb-6"
                  style=""
                  @focusout="UpdatePref('instagram_handle', settings.preferences.instagram_handle)"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Public Profile</td>
            <td>
              <div class="centerContainer">
                <va-switch size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Stats</td>
            <td>
              <div class="centerContainer">
                <va-switch size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Timelapse</td>
            <td>
              <div class="centerContainer">
                <va-switch size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Log List</td>
            <td>
              <div class="centerContainer">
                <va-switch size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Log Details</td>
            <td>
              <div class="centerContainer">
                <va-switch size="small" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
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

  const options = ['Ship Logs', 'Stays', 'Units']
  console.log(`${settings.value.first} ${settings.value.last}`)
  const fullName = ref(`${settings.value.first} ${settings.value.last}`)

  onBeforeMount(async () => {
    console.log(`onBeforeMount Overviewtab`)
    await fetchSettings()
    console.log(`${settings.value.first} ${settings.value.last}`)
  })

  const UpdatePref = async (key: string, value: any) => {
    if (!key) {
      return
    }
    console.debug(`Updating ${key}:${value}`)
    // Update GlobalStore should be automatic maybe need to use reactive()
    // API Call api.update_user_preferences({ key: ${key}, value: ${value} }) from the store
    const response = await updatePref(key, value)
    // Notify user on success or failure using va-toast.
    initToast({
      message: response.ok ? `Successfully updated ${key} with ${value}` : `Error updated ${key} with ${value}`,
      position: 'top-right',
      color: 'primary',
      //color: response.ok ? 'success' : 'warning',
    })
  }
</script>

<style lang="scss">
  .overview-tab {
    &__item {
      height: 55px;
      &-icon {
        min-width: 65px;
        max-width: 65px;
      }
    }
  }
  .centerContainer {
    display: flex;
    justify-content: center;
  }
  .full-table {
    width: 100%;
  }
</style>
