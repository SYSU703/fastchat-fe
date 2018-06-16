<template>
  <div>
    <div>friend list:</div>
    <li v-for="friend in friendList"
        :key="friend.userName">
      {{ friend.userName }} {{ friend.nickname }} {{ friend.email }} {{ friend.gender }}
    </li>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { UserComplete } from '@/models';

export default Vue.extend({
  name: 'FriendList',
  props: {},
  computed: {
    friendList(): UserComplete[] {
      return this.$store.state.friends.friendList;
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
