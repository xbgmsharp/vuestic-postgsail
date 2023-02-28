<template>
  <div class="notification-tab pt-2 layout">
    <div class="va-table-responsive">
      <table class="va-table full-table va-table--striped va-table--hoverable">
        <tbody>
          <tr>
            <td>E-mail Notifications</td>
            <td>
              <div class="centerConainer">
                <va-switch v-model="emailNotifications" size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Phone Notifications</td>
            <td>
              <div class="centerConainer">
                <QRCodeModal />
              </div>
            </td>
          </tr>
          <tr>
            <td>Alerting</td>
            <td>
              <div class="centerConainer">
                <va-switch v-model="alerting" size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Min Notification Interval(h)</td>
            <td>
              <div>
                <va-input v-model="minNotificationInterval" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Wind Speed (kts)</td>
            <td>
              <div>
                <va-input v-model="windSpeed" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Outdoor Temperature(C)</td>
            <td>
              <div>
                <va-input v-model="outdoorTemp" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Indoor Temperature(C)</td>
            <td>
              <div>
                <va-input v-model="indoorTemp" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Water Temperature</td>
            <td>
              <div>
                <va-input v-model="waterTemp" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Water Depth(m)</td>
            <td>
              <div>
                <va-input v-model="waterDepth" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Pressure(hpa)</td>
            <td>
              <div>
                <va-input v-model="pressure" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Pressure Drop in 12 hours (hpa)</td>
            <td>
              <div>
                <va-input v-model="presureDrop" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Battery Charge(%)</td>
            <td>
              <div>
                <va-input v-model="batteryCharge" class="mb-6" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Battery Voltage(V)</td>
            <td>
              <div>
                <va-input v-model="batteryBoltage" class="mb-6" />
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
  import { ref, onMounted } from 'vue'
  import PostgSail from '../../services/postgsail.js'
  import { useGlobalStore } from '../../stores/global-store'
  import QRCodeModal from './QRCodeModal.vue'
  import settingsData from '../../data/settings.json'
  const { t } = useI18n()
  const emailNotifications = ref(false)
  const phoneNotifications = ref(false)
  const alerting = ref(true)
  const minNotificationInterval = ref(6)
  const windSpeed = ref(0)
  const outdoorTemp = ref(0)
  const indoorTemp = ref(0)
  const waterTemp = ref(0)
  const waterDepth = ref(0)
  const pressure = ref()
  const presureDrop = ref()
  const batteryCharge = ref()
  const batteryBoltage = ref()
</script>

<style lang="scss" scoped>
  .notification-tab {
    &__item {
      height: 55px;
      &-icon {
        min-width: 65px;
        max-width: 65px;
      }
    }
  }
  .va-input-wrapper {
    margin-bottom: 1rem;
  }
  .centerConainer {
    display: flex;
    justify-content: center;
  }
  .full-table {
    width: 100%;
  }
</style>
