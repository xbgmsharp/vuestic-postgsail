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
                v-model="homepage_options[settings.preferences.preferred_homepage]"
                :options="homepage_options"
                outline
                @update:modelValue="UpdatePref('preferred_homepage', $event.value)"
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
                @update:modelValue="UpdatePref('use_imperial_units', $event)"
              />
            </td>
          </tr>
          <tr>
            <td>
              <va-popover class="mr-2 mb-2" icon="info" :message="$t('profile.msg.website')">
                {{ t('profile.website') }}
              </va-popover>
            </td>
            <td class="centerContainer">
              <VaInput
                v-model="localpref.website"
                outline
                placeholder="(e.g. https://openplotter.cloud)"
                @change="UpdatePref('website', settings.preferences.website)"
              />
            </td>
          </tr>
          <tr>
            <td>
              <va-popover class="mr-2 mb-2" icon="info" :message="$t('profile.msg.instagram_handle')">
                {{ t('profile.instagram_handle') }}
              </va-popover>
            </td>
            <td class="centerContainer">
              <va-input
                v-model="localpref.instagram_handle"
                outline
                placeholder="(e.g. @postgsail)"
                @change="UpdatePref('instagram_handle', settings.preferences.instagram_handle)"
              />
            </td>
          </tr>
          <tr>
            <td>
              <va-popover
                class="mr-2 mb-2"
                icon="info"
                :message="$t('profile.msg.public_profile', [settings.public_vessel])"
              >
                {{ t('profile.public_profile') }}
              </va-popover>
            </td>
            <td class="centerContainer">
              <va-switch
                v-model="settings.preferences.public_profile"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_profile', $event)"
              />
            </td>
          </tr>
          <template v-if="settings.preferences.public_profile">
            <tr class="sub-setting">
              <td>
                <va-popover
                  class="mr-2 mb-2"
                  icon="info"
                  :message="$t('profile.msg.public_name', [settings.public_vessel])"
                >
                  {{ t('profile.public_name') }}
                </va-popover>
              </td>
              <td class="">
                <VaInput
                  v-model.trim.lazy="localpref.public_vessel"
                  outline
                  :rules="[(v) => v.length > 3 || 'Field is required']"
                  @change="UpdatePref('public_vessel', settings.preferences.public_vessel)"
                />
                <p v-if="error_vessel">{{ error_vessel }}</p>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>
                <va-popover
                  class="mr-2 mb-2"
                  icon="info"
                  :message="$t('profile.msg.public_stats', [settings.public_vessel])"
                >
                  {{ t('profile.public_stats') }}
                </va-popover>
              </td>
              <td class="">
                <va-switch
                  v-model="settings.preferences.public_stats"
                  size="small"
                  outline
                  @update:modelValue="UpdatePref('public_stats', $event)"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  :href="$t('profile.url.public_stats', [settings.public_vessel])"
                  target="_blank"
                  class="va-link link"
                  style="padding-left: 2em"
                  >{{ $t('profile.url.public_stats', [settings.public_vessel]) }}</a
                >
              </td>
            </tr>
            <tr class="sub-setting">
              <td>
                <va-popover
                  class="mr-2 mb-2"
                  icon="error"
                  :message="$t('profile.msg.public_timelapse', [settings.public_vessel])"
                >
                  {{ t('profile.public_timelapse') }}
                </va-popover>
              </td>
              <td class="">
                <va-switch
                  v-model="settings.preferences.public_timelapse"
                  size="small"
                  outline
                  @update:modelValue="UpdatePref('public_timelapse', $event)"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  :href="$t('profile.url.public_timelapse', [settings.public_vessel])"
                  target="_blank"
                  class="va-link link"
                  style="padding-left: 2em"
                >
                  {{ $t('profile.url.public_timelapse', [settings.public_vessel]) }}</a
                >
              </td>
            </tr>
            <tr class="sub-setting">
              <td>
                <va-popover
                  class="mr-2 mb-2"
                  icon="info"
                  :message="$t('profile.msg.public_logs_list', [settings.public_vessel])"
                >
                  {{ t('profile.public_logs_list') }}
                </va-popover>
              </td>
              <td class="">
                <va-switch
                  v-model="settings.preferences.public_logs_list"
                  size="small"
                  outline
                  @update:modelValue="UpdatePref('public_logs_list', $event)"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  :href="$t('profile.url.public_logs_list', [settings.public_vessel])"
                  target="_blank"
                  class="va-link link"
                  style="padding-left: 2em"
                >
                  {{ $t('profile.url.public_logs_list', [settings.public_vessel]) }}</a
                >
              </td>
            </tr>
            <tr class="sub-setting">
              <td>
                <va-popover
                  class="mr-2 mb-2"
                  icon="info"
                  :message="$t('profile.url.public_logs', [settings.public_vessel, '{id}'])"
                >
                  {{ t('profile.public_logs') }}
                </va-popover>
              </td>
              <td class="">
                <va-switch
                  v-model="settings.preferences.public_logs"
                  size="small"
                  outline
                  @update:modelValue="UpdatePref('public_logs', $event)"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {{ $t('profile.url.public_logs', [settings.public_vessel, '{id}']) }}
              </td>
            </tr>
            <tr class="sub-setting">
              <td>
                <va-popover
                  class="mr-2 mb-2"
                  icon="info"
                  :message="$t('profile.msg.public_monitoring', [settings.public_vessel])"
                >
                  {{ t('menu.monitoring') }}
                </va-popover>
              </td>
              <td class="">
                <va-switch
                  v-model="settings.preferences.public_monitoring"
                  size="small"
                  outline
                  @update:modelValue="UpdatePref('public_monitoring', $event)"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  :href="$t('profile.url.public_monitoring', [settings.public_vessel])"
                  target="_blank"
                  class="va-link"
                  style="padding-left: 2em"
                >
                  {{ $t('profile.url.public_monitoring', [settings.public_vessel]) }}</a
                >
              </td>
            </tr>
            <tr class="sub-setting">
              <td>
                <va-popover class="mr-2 mb-2" icon="info" :message="$t('profile.msg.public_windy')">
                  Windy Station
                </va-popover>
              </td>
              <td class="">
                <va-switch
                  v-model="settings.preferences.public_windy"
                  size="small"
                  outline
                  @update:modelValue="UpdatePref('public_windy', $event)"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <template v-if="settings.preferences.windy">
                  <a
                    :href="$t('profile.url.public_windy', [settings.preferences.windy])"
                    target="_blank"
                    class="va-link"
                    style="padding-left: 2em"
                  >
                    {{ $t('profile.url.public_windy', [settings.preferences.windy]) }}</a
                  ></template
                >
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
  ])
  // TODO should be computed?
  console.log(`First Last: ${settings.value.first} ${settings.value.last}`)
  const fullName = ref(`${settings.value.first} ${settings.value.last}`)
  // TODO Issue getting default value as per store setup
  onBeforeMount(async () => {
    console.log(`onBeforeMount Overviewtab`)
    await fetchSettings()
    console.log(
      'OverviewTab onBeforeMount',
      `${settings.value.first} ${settings.value.last} ${settings.value.preferences.public_vessel}`,
      settings.value,
    )
    localpref.value = GlobalStore.settings.preferences
  })

  //const UpdatePref = async (key: string, value: any) => {
  const UpdatePref = async (key, value) => {
    if (!key || typeof value == 'undefined') return
    console.debug('OverviewTab UpdatePref', `Updating ${key}: ${value}`)
    // Ensure public vessel name math requirements
    const regex = /^\w{3,15}$/
    if (key == 'public_vessel' && !regex.test(value)) {
      error_vessel.value = 'Only alphanumeric (letters, numbers, regardless of case) plus underscore (_)'
      return
    }
    error_vessel.value = ''
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
</script>
