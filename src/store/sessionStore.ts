import Vue from 'vue';
import { UserComplete, LoginCredentials, CurrentUser } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    currentUser: null as CurrentUser,
  },
  getters: {

  },
  mutations: {
    userChange(state, newUser: CurrentUser) {
      if (newUser == null || typeof newUser !== 'object' || !newUser.userName) {
        state.currentUser = null;
      }
      state.currentUser = Object.assign({}, newUser);
    },
  },
  actions: {
    async login({ state, commit }, credentials: LoginCredentials) {
      const res =  await Vue.serviceAgent.login(credentials);
      commit('userChange', credentials);
      return res;
    },
  },
} as Module<{currentUser: CurrentUser}, {}>;
