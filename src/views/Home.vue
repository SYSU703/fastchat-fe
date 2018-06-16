<template>
  <div class="home">
    <p>current user: {{ user?user.userName:'null' }}</p>
    <FriendList :friend-list="friendList" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FriendList from '@/components/FriendList.vue';
import { UserComplete, LoginCredentials, CurrentUser } from '@/models';

export default Vue.extend({
  components: {
    FriendList,
  },
  computed: {
    user(): CurrentUser {
      return this.$store.state.session.currentUser;
    },
    friendList(): UserComplete[] {
      return this.$store.state.friends.friendList;
    },
  },
  created() {
    this.$store.dispatch('getFriendList');
  },
});
</script>
