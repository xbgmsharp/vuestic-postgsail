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
      <va-card-title> {{ $t('faq.desc') }} </va-card-title>
      <va-card-content class="layout gutter--md">
        <va-accordion>
          <va-collapse header="What is PostgSail">
            <p class="pa-3"></p>
            <p>
              PostgSail is a self-hosted or cloud based solution that is built by boaters for boaters. It automatically
              logs the details of your boat's trips. These include track, speed, distance, wind speed, etc. Each trip is
              automatically detected and logged without requiring you take any action like starting or stopping a trip.
            </p>
            <br />
            <p>
              At the end of each trip, a new log entry is automatically created, marking start and destination moorages.
              The time you spent at moorages will also be logged under Stays (e.g. Stayed 3 days in Eagle Harbor at
              anchor). You may need to manually categorize your stay as at anchor, mooring buoy or dock. If you choose
              to do so, that is the only manual thing to do, it is completely optional. And if you classify a stay,
              PostgSail will remember it the next time you visit the same moorage.
            </p>
            <br />
            <p>
              PostgSail aggregates information about your trips and provides you statistics including the number of
              trips, moorages you have been to, countries you have visited, longest passages, time you spent at anchor,
              mooring buoys etc. The easiest may be to look at the statistics of demo account as an example.
            </p>
            <br />
            <p>
              PostgSail also creates an automatic timelapse for all of your trips, animating the movements of your boat
              on a map. See a timelapse example here for a multi-week sail along the Canada coast from the demo account.
            </p>
            <br />
            <p>
              Your information stays private unless you explicitly decide to make it available publicly. If you choose
              to do so, your friends and others can access your logs, monitoring, statistics and timelapse.
            </p>
            <br />
          </va-collapse>
          <va-collapse header="Timelapse">
            <div class="pa-3">
              <p>
                Timelapse takes several parameters that allow customization:<br />
                <br />
                - color: Specifies the path color. Default: dodgerblue<br />
                - start_log and end_log: Specified in the log entry. Default: None<br />
                - start_date and end_date: Specified in whatever format (YYYY-MM-DD, DD-MM-YYYY). Default: None<br />
                - map_type: 0 for OpenStreetMap, 1 for Satellite, 2 for NOAA (for US only). Default: OpenStreetMap<br />
                - speed: Measured in milliseconds, controls the speed of animation. Lower values mean faster movement.
                Default: 75<br />
                - delay: Measured in seconds, allows pausing before starting the animation for screen captures. Default:
                0<br />
                - zoom: Specifies default zoom. Default: 10<br />
                <br />
                Example:
                <a
                  href="https://iot.openplotter.cloud/Elysian/timelapse?color=yellow&start_date=2021-05-01&end_date=2021-11-01&map_type=1&speed=90&delay=1&zoom=11"
                  target="_blank"
                  >https://iot.openplotter.cloud/Elysian/timelapse?color=yellow&start_date=2021-05-01&end_date=2021-11-01&map_type=1&speed=90&delay=1&zoom=11
                  <va-icon name="fa-external-link" size="small"
                /></a>
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Time, Distance, Temperatures, Depth Units">
            <div class="pa-3">
              All times from the backend are UTC. The frontend is doing the local conversion.<br />
              All distances from the backend are in Nautical Miles.<br />
              All temperatures from the backend are in Kelvin. The frontend will by default convert it to Celsius. To
              use Fahrenheit enable "Use Imperial Units".<br />
              All depth from the backend are in Meters. The frontend will by default display it as Meters. To use Foot
              enable "Use Imperial Units".<br />
              Check the
              <router-link class="va-text-bold va-link link" :to="{ name: 'explore' }">explore page</router-link> to see
              your signalk path.
            </div>
          </va-collapse>
          <va-collapse header="Energy">
            <div class="pa-3">
              <p>
                The energy widget search for the following pattern from your Signalk metrics:<br />
                - electrical.batteries.*.stateOfCharge<br />
                - electrical.solar.*.panelPower<br />
                - electrical.batteries.*.current<br />
                - electrical.batteries.*.voltage<br />
                - tanks.*.currentLevel.*<br />
                Check the
                <router-link class="va-text-bold va-link link" :to="{ name: 'explore' }">explore page</router-link> to
                see your signalk path.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Monitoring">
            <div class="pa-3">
              <p>
                Monitoring and History pages use the following path from Signalk:<br />
                - 'environment.water.temperature' AS waterTemperature<br />
                - 'environment.inside.temperature' AS insideTemperature<br />
                - 'environment.outside.temperature' AS outsideTemperature<br />
                - 'environment.wind.speedOverGround' AS windSpeedOverGround<br />
                - 'environment.wind.directionTrue' AS windDirectionTrue<br />
                - 'environment.inside.relativeHumidity' AS insideHumidity<br />
                - 'environment.outside.relativeHumidity' AS outsideHumidity<br />
                - 'environment.outside.pressure' AS outsidePressure<br />
                - 'environment.inside.pressure' AS insidePressure<br />
                - 'electrical.batteries.House.capacity.stateOfCharge' AS batteryCharge<br />
                - 'electrical.batteries.House.voltage' AS batteryVoltage<br />
                - 'environment.depth.belowTransducer' AS depth<br />
                Check the
                <router-link class="va-text-bold va-link link" :to="{ name: 'explore' }">explore page</router-link> to
                see your signalk path.<br />
                For reference,
                <a
                  href="https://signalk.org/specification/1.7.0/doc/vesselsBranch.html"
                  target="_blank"
                  class="va-text-bold va-link link"
                  >https://signalk.org/specification/1.7.0/doc/vesselsBranch.html<va-icon
                    name="fa-external-link"
                    size="small"
                /></a>
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Windy Personal Weather Station (PWS)">
            <div class="pa-3">
              <p>
                Using your settings page, you can enable your profile to be public. Once you enable it, you will see an
                option to publish your observations as a weather station on Windy.com.<br />
                <br />
                You must have the following SignalK path:<br />
                - 'environment.outside.temperature'<br />
                - 'environment.wind.speedOverGround'<br />
                - 'environment.wind.directionTrue'<br />
                - 'environment.outside.relativeHumidity'<br />
                - 'environment.outside.pressure'<br />
                <br />
                You must configure monitoring data source for wind direction as `environment.wind.directionTrue` on your
                monitoring device. This is necessary because reporting apparent wind directions to Windy will be very
                confusing for those who are processing it! Data for `environment.wind.directionTrue` will likely be
                unavailable in your NMEA network, which is expected. You can use the awesome derived-data plugin to
                easily calculate it. You need to have outdoor temperature coming through
                environment.outside.temperature. This is required as Windy doesn't accept observations that don't
                include temperature readings. The more marine weather observations we have, the better forecasts we will
                collectively have! Thank you for your turning boat into a live weather station!
                <br />
                It can take up to one hour for your station to be create and accessible in Windy. You will received a
                notification when it is ready.
                <br />
                Check the
                <router-link class="va-text-bold va-link link" :to="{ name: 'explore' }">explore page</router-link> to
                see your signalk path.<br />
                For reference:
                <br />
                -
                <a
                  href="https://signalk.org/specification/1.7.0/doc/vesselsBranch.html"
                  target="_blank"
                  class="va-text-bold va-link link"
                  >SignalK vessels specification<va-icon name="fa-external-link" size="small" /></a
                ><br />
                -
                <a
                  href="https://community.windy.com/topic/8168/report-your-weather-station-data-to-windy"
                  target="_blank"
                  class="va-text-bold va-link link"
                  >Report your Weather Station Data to Windy<va-icon name="fa-external-link" size="small"
                /></a>
              </p>
            </div>
          </va-collapse>
          <va-collapse header="URLs">
            <div class="pa-3">
              - Web Application:
              <a href="https://iot.openplotter.cloud/" target="_blank" class="va-text-bold va-link link"
                >https://iot.openplotter.cloud/ <va-icon name="fa-external-link" size="small" /></a
              ><br />
              - API:
              <a href="https://api.openplotter.cloud/" target="_blank" class="va-text-bold va-link link"
                >https://api.openplotter.cloud/ <va-icon name="fa-external-link" size="small" /></a
              ><br />
              - Grafana:
              <a href="https://app.openplotter.cloud/" target="_blank" class="va-text-bold va-link link"
                >https://app.openplotter.cloud/ <va-icon name="fa-external-link" size="small" /></a
              ><br />
              - Telegram Bot:
              <a href="https://t.me/pgsail_bot" target="_blank" class="va-text-bold va-link link"
                >https://t.me/pgsail_bot <va-icon name="fa-external-link" size="small" /></a
              ><br />
            </div>
          </va-collapse>
          <va-collapse header="Source Code">
            <div class="pa-3">
              <p>
                The project is free and open-source and I welcome any contribution and happy to work together. There is
                definitely some bugs and room for improvements. The movement detection from the signalk-plugin is done
                via the auto-state plugin. as much as possible, I try to keep the technology stack simple, SQL and
                Javascript with a bit of python. No middle ware to reduce code maintenance.
              </p>
              <p>
                Source:<br />
                - PostgSail Signalk plugin:
                <a
                  href="https://github.com/xbgmsharp/signalk-postgsail"
                  target="_blank"
                  class="va-text-bold va-link link"
                  >https://github.com/xbgmsharp/signalk-postgsail<va-icon name="fa-external-link" size="small" /></a
                ><br />
                - PostgSail backend:
                <a href="https://github.com/xbgmsharp/postgsail" target="_blank" class="va-text-bold va-link link"
                  >https://github.com/xbgmsharp/postgsail<va-icon name="fa-external-link" size="small" /></a
                ><br />
                - PostgSail frontend:
                <a
                  href="https://github.com/xbgmsharp/vuestic-postgsail"
                  target="_blank"
                  class="va-text-bold va-link link"
                  >https://github.com/xbgmsharp/vuestic-postgsail<va-icon name="fa-external-link" size="small" /></a
                ><br />
                - PostgSail Telegram:
                <a
                  href="https://github.com/xbgmsharp/postgsail-telegram-bot"
                  target="_blank"
                  class="va-text-bold va-link link"
                  >https://github.com/xbgmsharp/postgsail-telegram-bot<va-icon
                    name="fa-external-link"
                    size="small" /></a
                ><br />
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Contact">
            <div class="pa-3">
              You can send me an email or create a GitHub issue or join us on Discord.<br />
              -
              <a href="https://github.com/xbgmsharp/postgsail/issues" target="_blank" class="va-text-bold va-link link"
                >GitHub issue<va-icon name="fa-external-link" size="small" /></a
              ><br />
              -
              <a href="https://discord.gg/cpGqA5sZ" target="_blank" class="va-text-bold va-link link"
                >Discord<va-icon name="fa-external-link" size="small" /></a
              ><br />
            </div>
          </va-collapse>
        </va-accordion>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  const searchValue = ref('')
</script>

<style lang="scss"></style>
