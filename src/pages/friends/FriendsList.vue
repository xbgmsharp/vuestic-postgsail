<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import FollowModal from './FollowModal.vue'
  import FriendDetailsModal from './FriendDetailsModal.vue'
  import { useFriends, useFollowers, useGoPublicMutation } from '../../queries/friends'
  import type { Friend } from '../../queries/friends'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'

  const { t } = useI18n()

  const { data: friends, isLoading } = useFriends()
  const { data: followers, isLoading: followersLoading } = useFollowers()

  const GlobalStore = useGlobalStore()
  const { publicProfile } = storeToRefs(GlobalStore)
  const { mutate: goPublic, isPending: goingPublic } = useGoPublicMutation()

  const hasFriends = computed(() => (friends.value ?? []).length > 0)

  const showFollowModal = ref(false)
  const selectedFriend = ref<Friend | null>(null)

  function openFriend(friend: Friend) {
    selectedFriend.value = friend
  }
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="va-h4">{{ t('friends.title') }}</h1>
      <div class="flex gap-2">
        <RouterLink :to="{ name: 'friends' }">
          <VaButton preset="secondary" icon="map" round>{{ t('friends.tabs.map') }}</VaButton>
        </RouterLink>
        <VaButton icon="add" round @click="showFollowModal = true">
          {{ t('friends.follow_a_boat') }}
        </VaButton>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-10">
      <VaProgressCircle indeterminate />
    </div>

    <VaCard v-else-if="!hasFriends" class="p-6 text-center">
      <p class="va-text-secondary">{{ t('friends.empty') }}</p>
    </VaCard>

    <VaCard v-else>
      <VaCardTitle>{{ t('friends.list.title') }}</VaCardTitle>
      <VaCardContent>
        <VaDataTable
          :items="friends"
          :columns="[
            { key: 'label', label: t('friends.table.label') },
            { key: 'mmsi', label: t('friends.table.mmsi') },
            { key: 'status', label: t('friends.table.status') },
            { key: 'position_time', label: t('friends.table.position_time') },
            { key: 'distance_nm', label: t('friends.table.distance_nm') },
            { key: 'actions', label: '', width: 80 },
          ]"
        >
          <template #cell(label)="{ rowData }">
            <span class="font-medium">{{ rowData.label || rowData.mmsi }}</span>
          </template>
          <template #cell(status)="{ rowData }">
            <VaBadge
              :text="rowData.status || t('friends.table.status_unknown')"
              :color="rowData.status === 'online' ? 'success' : 'secondary'"
            />
          </template>
          <template #cell(position_time)="{ rowData }">
            <span v-if="rowData.position_time">{{ dateFormatUTC(rowData.position_time) }}</span>
            <span v-else>—</span>
          </template>
          <template #cell(distance_nm)="{ rowData }">
            <span v-if="rowData.distance_nm != null">{{ rowData.distance_nm }} nm</span>
            <span v-else>—</span>
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton icon="settings" preset="plain" round @click="openFriend(rowData as Friend)" />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardTitle>{{ t('friends.followers.title') }}</VaCardTitle>
      <VaCardContent>
        <div v-if="!publicProfile" class="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p class="va-text-secondary">{{ t('friends.followers.go_public_hint') }}</p>
          <VaButton :loading="goingPublic" round @click="() => goPublic()">
            {{ t('friends.followers.go_public') }}
          </VaButton>
        </div>

        <div v-if="followersLoading" class="flex justify-center py-6">
          <VaProgressCircle indeterminate />
        </div>
        <p v-else-if="!followers?.length" class="va-text-secondary">
          {{ t('friends.followers.empty') }}
        </p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="f in followers" :key="f.id" class="flex justify-between items-center">
            <span class="flex items-center gap-2">
              {{ f.follower_vessel_name || f.follower_mmsi }}
              <VaBadge v-if="f.mutual_possible" :text="t('friends.followers.mutual_hint')" color="info" />
            </span>
            <span class="va-text-secondary text-sm">{{ f.since }}</span>
          </li>
        </ul>
      </VaCardContent>
    </VaCard>

    <FollowModal v-model="showFollowModal" />
    <FriendDetailsModal :friend="selectedFriend" @close="selectedFriend = null" />
  </div>
</template>
