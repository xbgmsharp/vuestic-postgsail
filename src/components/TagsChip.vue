<template>
  <div class="flex flex-wrap items-center justify-center">
    <va-chip v-for="chip in items" :key="chip" size="small" outline class="flex-grow-0 flex-shrink xs-chip mr-1 mb-1">
      {{ chip }}
    </va-chip>
    <span
      v-if="more > 0"
      class="flex-grow-0 flex-shrink xs-chip bg-blue-200 text-gray-800 py-1 px-2 rounded-full mr-2 mb-1"
    >
      +{{ more }}
    </span>
  </div>
</template>

<script>
  export default {
    name: 'TagsChip',
    props: {
      tags: Array,
      maxShow: Number,
    },
    emits: ['clickFromChildComponent'],
    data() {
      let displayedTags = this.tags
      let more = 0
      if (this.tags && this.maxShow && this.tags.length > this.maxShow) {
        displayedTags = this.tags.slice(0, this.maxShow)
        more = this.tags.length - this.maxShow
      }
      return {
        items: displayedTags,
        more: more,
      }
    },
    methods: {},
  }
</script>

<style lang="scss" scoped>
  .xs-chip {
    padding: 0.25rem 0.25rem;
    font-size: 0.75rem;
    line-height: 1;
    height: 1.1rem;
  }
</style>
