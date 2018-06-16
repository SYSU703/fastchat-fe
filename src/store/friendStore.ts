import Vue from 'vue';
import { UserComplete, LoginCredentials, CurrentUser } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    friendList: [] as UserComplete[],
  },
  getters: {

  },
  mutations: {
    updateFriendList(state, friendList: UserComplete[] | null) {
      if (!friendList) { friendList = []; }
      state.friendList = friendList;
    },
  },
  actions: {
    async getFriendList({ state, commit }) {
      const res = await Vue.serviceAgent.getFriendList();
      commit('updateFriendList', res.data);
    },
  },
} as Module<{ friendList: UserComplete[] | null }, {}>;
