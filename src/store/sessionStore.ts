import Vue from 'vue';
import { UserComplete, LoginCredentials } from '@/models';
import { Module } from 'vuex';

export default {
  state: {
    currentUser: null as UserComplete | null,
  },
  getters: {

  },
  mutations: {
    userChange(state, newUser: UserComplete | null): void {
      if (newUser == null || typeof newUser !== 'object' || !newUser.userName) {
        state.currentUser = null;
        return;
      }
      state.currentUser = Object.assign({}, newUser);
    },
  },
  actions: {
    async login({ state, commit }, credentials: LoginCredentials) {
      const res = await Vue.serviceAgent.login(credentials);
      commit('userChange', res.data);
      return res;
    },
    async logout({ state, commit }) {
      const res = await Vue.serviceAgent.logout();
      if (!res.success) {
        throw new Error('登出失败');
      }
      commit('userChange', null);
      return res;
    },
    async tryResumeSession({ state, commit }) {
      if (!state.currentUser) {
        const resumedUser = Vue.serviceAgent.tryResumeSession();
        if (!resumedUser) { return null; }
        commit('userChange', resumedUser);
        return resumedUser;
      } else {
        return state.currentUser;
      }
    },
  },
} as Module<{ currentUser: UserComplete | null }, {}>;
