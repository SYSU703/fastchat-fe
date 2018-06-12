<template>
  <div class="home">
    <div>{{ userName }}</div>
    <img src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HelloWorld from '@/components/HelloWorld.vue';
import { User, LoginCredentials, UserState } from '@/models';

export default Vue.extend({
  components: {
    HelloWorld,
  },
  computed: {
    userName(): User | null {
      const user = this.$store.state.session.currentUser;
      return user ? user.userName : 'null';
    },
  },
});
</script>
