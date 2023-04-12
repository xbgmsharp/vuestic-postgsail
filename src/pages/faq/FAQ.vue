<template>
  <div>
    <va-card class="mb-3">
      <va-card-title> {{ $t('faq.title') }} </va-card-title>
      <va-card-content class="layout gutter--md">
        <va-input>
          <template #prepend>
            <va-icon name="search" />
          </template>
        </va-input>
      </va-card-content>
    </va-card>
    <va-card class="mb-3">
      <va-card-title> Frequently Asked Questions </va-card-title>
      <va-card-content class="layout gutter--md">
        <va-accordion>
          <va-collapse header="What is PostgSail">
            <div class="pa-3">
              PostgSail is a cloud based solution that is built by boaters for boaters. It automatically logs the
              details of your boat's trips. These include track, speed, distance, wind speed, etc. Each trip is
              automatically detected and logged without requiring you take any action like starting or stopping a trip.
              <br />
              At the end of each trip, a new log entry is automatically created, marking start and destination moorages.
              The time you spent at moorages will also be logged under Stays (e.g. Stayed 3 days in Eagle Harbor at
              anchor). You may need to manually categorize your stay as at anchor, mooring buoy or dock. If you choose
              to do so, that is the only manual thing to do, it is completely optional. And if you classify a stay,
              PostgSail will remember it the next time you visit the same moorage.
              <br />
              PostgSail aggregates information about your trips and provides you statistics including the number of
              trips, moorages you have been to, countries you have visited, longest passages, time you spent at anchor,
              mooring buoys etc. The easiest may be to look at the statistics of one of our founders as an example.
              <br />
              PostgSail also creates an automatic timelapse for all of your trips, animating the movements of your boat
              on a map. See a timelapse example here for a multi-week sail along the California coast between San
              Francisco and Ensenada.
              <br />
              Your information stays private unless you explicitly decide to make it available publicly. If you choose
              to do so, your friends and others can access your statistics and timelapse.
            </div>
          </va-collapse>
          <va-collapse header="Timelapse">
            <div class="pa-3">
              <p>
                Timelapse takes several parameters that allow customization:<br />
                <br />
                color: Specifies the path color. Default: dodgerblue start_date and end_date: Specified in YYYY-MM-DD
                format. Default: None<br />
                map_type: 0 for OpenStreetMap, 1 for Satellite, 2 for NOAA (for US only). Default: OpenStreetMap<br />
                speed: Measured in milliseconds, controls the speed of animation. Lower values mean faster movement.
                Default: 75<br />
                delay: Measured in seconds, allows pausing before starting the animation for screen captures. Default:
                0<br />
                zoom: Specifies default zoom. Default: 10<br />
                <br />
                Example:
                https://saillogger.com/timelapse/2/?color=yellow&start_date=2020-06-01&end_date=2020-07-31&map_type=1&speed=90&delay=1&zoom=11
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Time and Distance Units">
            <div class="pa-3">
              All time from the backend are UTC. The frontend is doing the local convertion.<br />
              All distance from the backend are in Nautical Miles. The frontend is doing the local convertion if
              imperial Units is true.
            </div>
          </va-collapse>
          <va-collapse header="URLs">
            <div class="pa-3">
              - Web Application: https://iot.openplotter.cloud/<br />
              - API: https://api.openplotter.cloud/<br />
              - Grafana: https://app.openplotter.cloud/<br />
              - Telegram Bot: https://t.me/pgsail_bot<br />
            </div>
          </va-collapse>
          <va-collapse header="Source Code">
            <div class="pa-3">
              <p>
                Source:<br />
                - PostgSail Signalk plugin: https://github.com/xbgmsharp/signalk-postgsail<br />
                - PostgSail backend: https://github.com/xbgmsharp/postgsail<br />
                - PostgSail frontend: https://github.com/xbgmsharp/vuestic-postgsail<br />
                - PostgSail Telegram: https://github.com/xbgmsharp/postgsail-telegram-bot<br />
              </p>
            </div>
          </va-collapse>
        </va-accordion>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
</script>

<style lang="scss"></style>
