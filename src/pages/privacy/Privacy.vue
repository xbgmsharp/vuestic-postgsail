<template>
  <div>
    <va-card class="mb-3">
      <va-card-title> {{ $t('privacy.title') }} </va-card-title>
      <va-card-content class="layout gutter--md">
        <va-input>
          <template #prepend>
            <va-icon name="search" />
          </template>
        </va-input>
      </va-card-content>
    </va-card>
    <va-card class="mb-3">
      <va-card-title> {{ $t('privacy.desc') }} </va-card-title>
      <va-card-content class="layout gutter--md">
        <va-accordion>
          <va-collapse header="Private information">
            <p class="pa-3"></p>
            <p>
              Protecting your private information is our priority. This Statement of Privacy applies to PostgSail and
              governs data collection and usage. The PostgSail website automatically logs the data and trips of your
              vessel(s). By using the PostgSail website, you consent to the data practices described in this statement.
            </p>
            <h4>Collection of your Personal Information</h4>
            <p>
              In order to better provide you with products and services offered, PostgSail may collect personally
              identifiable information, such as your:
            </p>
            <ul>
              <li>First and Last Name</li>
              <li>E-mail Address</li>
              <li>Vessel Name and Details (e.g. MMSI)</li>
              <li>VesselPosition Records (Latitude and Longitude)</li>
              <li>
                Data available on the vessel network (depth, speed, heading, temperature, atmospheric pressure, etc.)
              </li>
            </ul>
            <p>
              If you purchase PostgSail's products and services, we collect billing and credit card information. This
              information is used to complete the purchase transaction.
            </p>
            <p>
              Please keep in mind that if you directly disclose personally identifiable information or personally
              sensitive data through PostgSail's public message boards, this information may be collected and used by
              others.
            </p>
            <p>
              We do not collect any personal information about you unless you voluntarily provide it to us. However, you
              may be required to provide certain personal information to us when you elect to use certain products or
              services. These may include: (a) registering for an account; (b) entering a sweepstakes or contest
              sponsored by us or one of our partners; (c) signing up for special offers from selected third parties; (d)
              sending us an email message; (e) submitting your credit card or other payment information when ordering
              and purchasing products and services. To wit, we will use your information for, but not limited to,
              communicating with you in relation to services and/or products you have requested from us. We also may
              gather additional personal or non-personal information in the future.
            </p>
          </va-collapse>
          <va-collapse header="Use of your Personal Information">
            <div class="pa-3">
              <p>
                PostgSail collects and uses your personal information to operate and deliver the services you have
                requested.
              </p>
              <p>
                PostgSail may also use your personally identifiable information to inform you of other products or
                services available from PostgSail and its affiliates.
              </p>
              <h4>Sharing Information with Third Parties</h4>
              <p>PostgSail does not sell, rent or lease its customer lists to third parties.</p>
              <p>
                PostgSail may share data with trusted partners to help perform statistical analysis, send you email or
                postal mail, provide customer support, or arrange for deliveries. All such third parties are prohibited
                from using your personal information except to provide these services to PostgSail, and they are
                required to maintain the confidentiality of your information.
              </p>
              <p>
                PostgSail may disclose your personal information, without notice, if required to do so by law or in the
                good faith belief that such action is necessary to: (a) conform to the edicts of the law or comply with
                legal process served on PostgSail or the site; (b) protect and defend the rights or property of
                PostgSail; and/or (c) act under exigent circumstances to protect the personal safety of users of
                PostgSail, or the public.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Tracking User Behavior">
            <div class="pa-3">
              <p>
                PostgSail may keep track of the websites and pages our users visit within PostgSail, in order to
                determine what PostgSail services are the most popular. This data is used to deliver customized content
                and advertising within PostgSail to customers whose behavior indicates that they are interested in a
                particular subject area.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Automatically Collected Information">
            <div class="pa-3">
              <p>
                Information about your computer hardware and software may be automatically collected by PostgSail. This
                information can include: your IP address, browser type, domain names, access times and referring website
                addresses. This information is used for the operation of the service, to maintain quality of the
                service, and to provide general statistics regarding use of the PostgSail website.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Use of Cookies">
            <div class="pa-3">
              <p>
                The PostgSail website may use "cookies" to help you personalize your online experience. A cookie is a
                text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs
                or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web
                server in the domain that issued the cookie to you.
              </p>
              <p>
                One of the primary purposes of cookies is to provide a convenience feature to save you time. The purpose
                of a cookie is to tell the Web server that you have returned to a specific page. For example, if you
                personalize PostgSail pages, or register with PostgSail site or services, a cookie helps PostgSail to
                recall your specific information on subsequent visits. This simplifies the process of recording your
                personal information, such as billing addresses, shipping addresses, and so on. When you return to the
                same PostgSail website, the information you previously provided can be retrieved, so you can easily use
                the PostgSail features that you customized.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Links">
            <div class="pa-3">
              <p>
                This website contains links to other sites. Please be aware that we are not responsible for the content
                or privacy practices of such other sites. We encourage our users to be aware when they leave our site
                and to read the privacy statements of any other site that collects personally identifiable information.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Security of your Personal Information">
            <div class="pa-3">
              <p>
                PostgSail secures your personal information from unauthorized access, use, or disclosure. PostgSail uses
                the following methods for this purpose:
              </p>
              <ul>
                <li>SSL Protocol</li>
              </ul>
              <p>
                When personal information (such as a credit card number) is transmitted to other websites, it is
                protected through the use of encryption, such as the Secure Sockets Layer (SSL) protocol.
              </p>
              <p>
                We strive to take appropriate security measures to protect against unauthorized access to or alteration
                of your personal information. Unfortunately, no data transmission over the Internet or any wireless
                network can be guaranteed to be 100% secure. As a result, while we strive to protect your personal
                information, you acknowledge that: (a) there are security and privacy limitations inherent to the
                Internet which are beyond our control; and (b) security, integrity, and privacy of any and all
                information and data exchanged between you and us through this Site cannot be guaranteed.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Right to Deletion">
            <div class="pa-3">
              <p>Subject to certain exceptions set out below, on receipt of a verifiable request from you, we will:</p>
              <ul>
                <li>Delete your personal information from our records; and</li>
                <li>Direct any service providers to delete your personal information from their records.</li>
              </ul>
              <p>
                Please note that we may not be able to comply with requests to delete your personal information if it is
                necessary to:
              </p>
              <ul>
                <li>
                  Complete the transaction for which the personal information was collected, fulfill the terms of a
                  written warranty or product recall conducted in accordance with federal law, provide a good or service
                  requested by you, or reasonably anticipated within the context of our ongoing business relationship
                  with you, or otherwise perform a contract between you and us;
                </li>
                <li>
                  Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity; or
                  prosecute those responsible for that activity;
                </li>
                <li>Debug to identify and repair errors that impair existing intended functionality;</li>
                <li>
                  Exercise free speech, ensure the right of another consumer to exercise his or her right of free
                  speech, or exercise another right provided for by law;
                </li>
                <li>Comply with the California Electronic Communications Privacy Act;</li>
                <li>
                  Engage in public or peer-reviewed scientific, historical, or statistical research in the public
                  interest that adheres to all other applicable ethics and privacy laws, when our deletion of the
                  information is likely to render impossible or seriously impair the achievement of such research,
                  provided we have obtained your informed consent;
                </li>
                <li>
                  Enable solely internal uses that are reasonably aligned with your expectations based on your
                  relationship with us;
                </li>
                <li>Comply with an existing legal obligation; or</li>
                <li>
                  Otherwise use your personal information, internally, in a lawful manner that is compatible with the
                  context in which you provided the information.
                </li>
              </ul>
            </div>
          </va-collapse>
          <va-collapse header="Children Under Thirteen">
            <div class="pa-3">
              <p>
                PostgSail does not knowingly collect personally identifiable information from children under the age of
                thirteen. If you are under the age of thirteen, you must ask your parent or guardian for permission to
                use this website.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="E-mail Communications">
            <div class="pa-3">
              <p>
                From time to time, PostgSail may contact you via email for the purpose of providing announcements,
                promotional offers, alerts, confirmations, surveys, and/or other general communication.
              </p>
              <p>
                If you would like to stop receiving marketing or promotional communications via email from PostgSail,
                you may opt out of such communications by Updating their user preferences to disable e-mails.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="External Data Storage Sites">
            <div class="pa-3">
              <p>
                We may store your data on servers provided by third party hosting vendors with whom we have contracted.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Changes to this Statement">
            <div class="pa-3">
              <p>
                PostgSail reserves the right to change this Privacy Policy from time to time. We will notify you about
                significant changes in the way we treat personal information by sending a notice to the primary email
                address specified in your account, by placing a prominent notice on our website, and/or by updating any
                privacy information. Your continued use of the website and/or Services available after such
                modifications will constitute your: (a) acknowledgment of the modified Privacy Policy; and (b) agreement
                to abide and be bound by that Policy.
              </p>
            </div>
          </va-collapse>
          <va-collapse header="Contact Information">
            <div class="pa-3">
              <p>
                PostgSail welcomes your questions or comments regarding this Statement of Privacy. If you believe that
                PostgSail has not adhered to this Statement, please contact PostgSail at:
              </p>
              <p>PostgSail</p>
              <p>Email Address:</p>
              <p></p>
              <p>_________________</p>
              <p>Effective as of January 1, 2021</p>
            </div>
          </va-collapse>
        </va-accordion>
      </va-card-content>
    </va-card>
  </div>
</template>

<script>
  import { defineComponent } from 'vue'
  export default defineComponent({
    data() {
      return {}
    },
  })
</script>

<style lang="scss"></style>
