<template>
  <div class="leaflet-map__full">
    <FriendsLeafletMap
      id="friends-map-full"
      style="width: 100%; height: calc(100vh - 4.5rem)"
      :friends="friends"
      :map-zoom="4"
      @manage="openFriendById"
      @add-friend="showFollowModal = true"
      @view-list="goToList"
    />

    <FollowModal v-model="showFollowModal" />
    <FriendDetailsModal :friend="selectedFriend" @close="selectedFriend = null" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import FriendsLeafletMap from '../../components/maps/leafletMapFriends.vue'
  import FollowModal from './FollowModal.vue'
  import FriendDetailsModal from './FriendDetailsModal.vue'
  import { useFriends } from '../../queries/friends'
  import type { Friend } from '../../queries/friends'

  const router = useRouter()
  const { data: friends } = useFriends()

  const showFollowModal = ref(false)
  const selectedFriend = ref<Friend | null>(null)

  function goToList() {
    router.push({ name: 'friends-list' })
  }

  function openFriendById(id: number) {
    const friend = (friends.value ?? []).find((f: Friend) => f.id === id)
    if (friend) selectedFriend.value = friend
  }
</script>
