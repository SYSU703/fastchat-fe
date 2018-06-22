import Vue from 'vue';
import { Friend } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    friendList: [] as Friend[],
  },
  getters: {

  },
  mutations: {
    loadFriendList(state, friendList: Friend[] | null) {
      if (!friendList) { friendList = []; }
      state.friendList = friendList;
    },
  },
  actions: {
    async getFriendList({ state, commit }) {
      const res = await Vue.serviceAgent.getFriendList();
      commit('loadFriendList', res.data);
    },
    async resetFriends({ commit }) {
      commit('loadFriendList', null);
    },
  },
} as Module<{ friendList: Friend[] }, {}>;
