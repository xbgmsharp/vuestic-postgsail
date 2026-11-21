<template>
  <div>
    <!-- Help: points to the user guide on docs.openplotter.cloud -->
    <va-card class="layout mx-auto my-6 p-6">
      <va-card-title class="text-2xl font-bold text-primary mb-2"> 📖 Help & documentation </va-card-title>
      <va-card-content class="text-base leading-relaxed">
        <p class="mb-4">
          The user guide explains how PostgSail logs your trips and stays, which SignalK paths each page uses, and how
          to fix the most common problems.
        </p>

        <va-button color="primary" icon="menu_book" :href="DOCS_URL" target="_blank" class="mb-6">
          Open the user guide
        </va-button>

        <h3 class="text-xl font-semibold text-secondary mb-2">Popular topics</h3>
        <ul class="mb-4 space-y-2">
          <li v-for="topic in topics" :key="topic.page">
            <a :href="`${DOCS_URL}/${topic.page}`" target="_blank" rel="noopener" class="va-text-bold va-link link">
              {{ topic.title }} <va-icon name="fa-external-link" size="small" />
            </a>
            <span> – {{ topic.description }}</span>
            <router-link v-if="topic.route" :to="{ name: topic.route }" class="va-link link ml-2">
              {{ topic.routeLabel }} →
            </router-link>
          </li>
        </ul>

        <p>
          To check which SignalK paths your boat sends, open the
          <router-link class="va-text-bold va-link link" :to="{ name: 'explore' }">Explore page</router-link>.
        </p>
      </va-card-content>
    </va-card>

    <!-- Contact -->
    <va-card class="layout mx-auto my-6 p-6">
      <va-card-title class="text-2xl font-bold text-primary mb-2"> 💬 Contact </va-card-title>
      <va-card-content class="text-base leading-relaxed">
        <p class="mb-4">
          Questions, bugs or ideas? Ask the community on Discord, open a GitHub issue, or send us an email.
        </p>
        <div class="flex flex-wrap gap-2">
          <va-button color="primary" href="https://discord.gg/uuZrwz4dCS" target="_blank"> Discord </va-button>
          <va-button color="primary" href="https://github.com/xbgmsharp/postgsail/issues" target="_blank">
            GitHub issue
          </va-button>
          <va-button color="primary" icon="email" href="mailto:info@openplotter.cloud?subject=PostgSail">
            Email us
          </va-button>
        </div>
      </va-card-content>
    </va-card>

    <!-- Sponsor -->
    <va-card class="layout mx-auto my-6 p-6">
      <va-card-title class="text-2xl font-bold text-primary mb-2"> ⛵ Support PostgSail </va-card-title>
      <va-card-content class="text-base leading-relaxed">
        <p class="mb-4">
          PostgSail is built by boaters for boaters, and sailors in more than 70 countries use it. It's free and open
          source, but it isn't free to build or host.
        </p>

        <h3 class="text-xl font-semibold text-secondary mb-2">Your support pays for</h3>
        <ul class="list-disc ml-5 mb-4 space-y-1">
          <li>Hosting your data in a European sovereign cloud</li>
          <li>Bug fixes, maintenance and new features</li>
          <li>The user guide and documentation</li>
        </ul>

        <p class="mb-6">
          Please consider a monthly or one-time donation through GitHub Sponsors. Can't give? Spreading the word,
          reporting bugs and contributing code or documentation also help.
        </p>

        <va-button color="success" icon="sponsor" href="https://github.com/sponsors/xbgmsharp" target="_blank">
          Sponsor on GitHub
        </va-button>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  const DOCS_URL = 'https://docs.openplotter.cloud'

  // Each topic links to a docs page, plus an optional in-app page to jump to.
  const topics = [
    {
      title: 'FAQ',
      page: 'user/faq.html',
      description: 'what PostgSail does, units, where your data is stored',
    },
    {
      title: 'No data showing?',
      page: 'user/troubleshooting.html',
      description: 'why metrics get ignored and how to fix it',
    },
    {
      title: 'Your boat',
      page: 'user/boat.html',
      description: 'photo, make and model, sailboatdata.com specs and SignalK sync',
      route: 'boats',
      routeLabel: 'Boats',
    },
    {
      title: 'Monitoring & energy',
      page: 'user/monitoring.html',
      description: 'the SignalK paths each widget reads',
      route: 'boat-mapping',
      routeLabel: 'Boat correlation',
    },
    {
      title: 'Timelapse',
      page: 'user/timelapse.html',
      description: 'replay, customize and share your trips',
      route: 'timelapse-form',
      routeLabel: 'Create a timelapse',
    },
    {
      title: 'Windy weather station',
      page: 'user/windy.html',
      description: 'publish your weather observations on Windy.com',
    },
    {
      title: 'NoForeignland',
      page: 'user/noforeignland.html',
      description: 'show your boat on the noforeignland community map',
    },
    {
      title: 'AI assistant (MCP)',
      page: 'mcp.html',
      description: 'ask Claude, Le Chat and other assistants about your boat',
    },
  ]
</script>
